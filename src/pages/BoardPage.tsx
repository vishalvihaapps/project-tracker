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
import { ArrowLeftIcon } from '../components/Icon'
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
    <div className="flex h-full flex-col">
      <Navbar />

      {/* breadcrumb */}
      <div className="flex items-center gap-3 border-b border-hair px-6 py-3.5">
        <Link to="/" className="btn btn-ghost !px-2.5 !py-1.5 !text-[13px]">
          <ArrowLeftIcon size={15} />
          Boards
        </Link>
        <span className="text-dim">/</span>
        <h1 className="min-w-0 truncate text-lg font-bold">
          {boardName || 'Board'}
        </h1>
      </div>

      {(dragError || error) && (
        <p className="border-b border-danger/20 bg-danger/10 px-6 py-2 text-sm text-danger">
          {dragError ?? error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted">
          Loading board…
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="min-h-0 flex-1">
            <div className="flex h-full gap-4 overflow-x-auto px-6 py-5">
              {COLUMNS.map((col, i) => (
                <Column
                  key={col.id}
                  index={i}
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
