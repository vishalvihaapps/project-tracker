import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import Navbar from '../components/Navbar'
import Column from '../components/Column'
import TaskCard from '../components/TaskCard'
import CardModal, { type CardModalState } from '../components/CardModal'
import { useCards } from '../hooks/useCards'
import { supabase } from '../lib/supabase'
import { COLUMNS } from '../types/database'
import type { Card } from '../types/database'
import { flattenGroups, groupCards, isStatus } from '../lib/kanban'

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const {
    cards,
    setCards,
    cardsRef,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    saveLayout,
  } = useCards(boardId)

  const [boardName, setBoardName] = useState('')
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [dragError, setDragError] = useState<string | null>(null)
  const [modal, setModal] = useState<CardModalState | null>(null)

  // Snapshot of card layout taken when a drag starts, used to revert/diff.
  const snapshotRef = useRef<Card[]>([])

  useEffect(() => {
    if (!boardId) return
    supabase
      .from('boards')
      .select('name')
      .eq('id', boardId)
      .single()
      .then(({ data }) => {
        if (data) setBoardName(data.name)
      })
  }, [boardId])

  const sensors = useSensors(
    // distance constraint lets a plain click open the card modal
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const grouped = useMemo(() => groupCards(cards), [cards])

  /** Resolve an id (card id or column status) to its column status. */
  function findContainer(id: string) {
    if (isStatus(id)) return id
    return cardsRef.current.find((c) => c.id === id)?.status ?? null
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    setActiveCard(cardsRef.current.find((c) => c.id === id) ?? null)
    snapshotRef.current = cardsRef.current.map((c) => ({ ...c }))
    setDragError(null)
  }

  /** Live-move the dragged card into a different column for instant preview. */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const from = findContainer(activeId)
    const to = findContainer(overId)
    if (!from || !to || from === to) return

    setCards((prev) => {
      const g = groupCards(prev)
      const fromIdx = g[from].findIndex((c) => c.id === activeId)
      if (fromIdx === -1) return prev
      const [moved] = g[from].splice(fromIdx, 1)
      moved.status = to

      let insertAt = g[to].length
      if (!isStatus(overId)) {
        const overIdx = g[to].findIndex((c) => c.id === overId)
        if (overIdx !== -1) insertAt = overIdx
      }
      g[to].splice(insertAt, 0, moved)
      return flattenGroups(g)
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const from = findContainer(activeId)
    const to = findContainer(overId)
    if (!from || !to) return

    let finalCards = cardsRef.current
    if (from === to) {
      // Reorder within the same column.
      const g = groupCards(cardsRef.current)
      const col = g[to]
      const oldIndex = col.findIndex((c) => c.id === activeId)
      let newIndex = col.length - 1
      if (!isStatus(overId)) {
        const oi = col.findIndex((c) => c.id === overId)
        if (oi !== -1) newIndex = oi
      }
      if (oldIndex !== -1 && oldIndex !== newIndex) {
        g[to] = arrayMove(col, oldIndex, newIndex)
      }
      finalCards = flattenGroups(g)
    } else {
      // Cross-column move was already applied in handleDragOver.
      finalCards = flattenGroups(groupCards(cardsRef.current))
    }

    setCards(finalCards)

    void saveLayout(finalCards, snapshotRef.current).then(
      ({ error: saveError }) => {
        if (saveError) {
          setCards(snapshotRef.current) // revert on failure
          setDragError(`Could not save changes: ${saveError}`)
        }
      },
    )
  }

  function handleDragCancel() {
    setActiveCard(null)
    setCards(snapshotRef.current)
  }

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <Navbar />

      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <Link
          to="/"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← All boards
        </Link>
        {boardName && (
          <>
            <span className="text-slate-300">/</span>
            <h1 className="font-semibold text-slate-800">{boardName}</h1>
          </>
        )}
      </div>

      {(dragError || error) && (
        <p className="bg-red-50 px-6 py-2 text-sm text-red-700">
          {dragError ?? error}
        </p>
      )}

      {loading ? (
        <p className="p-6 text-slate-400">Loading board…</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex flex-1 gap-4 overflow-x-auto p-6">
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                status={col.id}
                label={col.label}
                cards={grouped[col.id]}
                onAddCard={() =>
                  setModal({ mode: 'create', status: col.id })
                }
                onCardClick={(card) => setModal({ mode: 'edit', card })}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? <TaskCard card={activeCard} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {modal && (
        <CardModal
          state={modal}
          onClose={() => setModal(null)}
          onCreate={createCard}
          onUpdate={updateCard}
          onDelete={deleteCard}
        />
      )}
    </div>
  )
}
