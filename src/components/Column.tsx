import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import type { Card, CardStatus } from '../types/database'

interface ColumnProps {
  status: CardStatus
  label: string
  cards: Card[]
  onAddCard: () => void
  onCardClick: (card: Card) => void
}

export default function Column({
  status,
  label,
  cards,
  onAddCard,
  onCardClick,
}: ColumnProps) {
  // The column id is the status string, so a drop on empty space resolves here.
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-200/70">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="rounded-full bg-slate-300/80 px-2 text-xs font-medium text-slate-600">
          {cards.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[60px] flex-1 flex-col gap-2 rounded-lg px-2 pb-2 transition-colors ${
          isOver ? 'bg-indigo-100/70' : ''
        }`}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-slate-400">
            No cards
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onAddCard}
        className="m-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-300/70"
      >
        + Add card
      </button>
    </div>
  )
}
