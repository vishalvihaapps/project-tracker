import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import { PlusIcon } from './Icon'
import type { Card, CardStatus } from '../types/database'

const DOT: Record<CardStatus, string> = {
  todo: '#60a5fa',
  in_progress: '#7c6af7',
  complete: '#34d399',
  archive: '#6b6877',
}

interface ColumnProps {
  status: CardStatus
  label: string
  /** Column position — drives the load stagger animation. */
  index: number
  cards: Card[]
  onAddCard: () => void
  onCardClick: (card: Card) => void
}

export default function Column({
  status,
  label,
  index,
  cards,
  onAddCard,
  onCardClick,
}: ColumnProps) {
  // The column id is the status string, so a drop on empty space resolves here.
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      className="kb-column col-enter"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-2 px-3.5 py-3">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: DOT[status] }}
        />
        <h2 className="text-sm font-bold">{label}</h2>
        <span className="rounded-full border border-hair px-2 py-0.5 text-[11px] font-semibold text-muted">
          {cards.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`kb-column__body ${isOver ? 'is-over' : ''}`}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card, i) => (
            <TaskCard
              key={card.id}
              card={card}
              index={i}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-10 text-center text-xs text-dim">
            No cards yet
          </div>
        )}
      </div>

      <div className="p-2.5 pt-0">
        <button
          type="button"
          onClick={onAddCard}
          className="btn btn-ghost w-full"
        >
          <PlusIcon size={15} />
          Add card
        </button>
      </div>
    </div>
  )
}
