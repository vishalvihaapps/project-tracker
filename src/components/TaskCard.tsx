import { useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '../types/database'

interface TaskCardProps {
  card: Card
  onClick?: () => void
  /** Renders the static preview shown inside the DragOverlay. */
  overlay?: boolean
}

export default function TaskCard({
  card,
  onClick,
  overlay = false,
}: TaskCardProps) {
  const downAt = useRef<{ x: number; y: number } | null>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id })

  if (overlay) {
    return (
      <div className="rotate-2 rounded-lg border border-indigo-300 bg-white p-3 shadow-lg">
        <CardBody card={card} />
      </div>
    )
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        downAt.current = { x: e.clientX, y: e.clientY }
        listeners?.onPointerDown?.(e)
      }}
      onClick={(e) => {
        // Distinguish a click from the tail of a drag gesture.
        const start = downAt.current
        if (start) {
          const moved =
            Math.abs(e.clientX - start.x) > 5 ||
            Math.abs(e.clientY - start.y) > 5
          if (moved) return
        }
        onClick?.()
      }}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <CardBody card={card} />
    </div>
  )
}

function CardBody({ card }: { card: Card }) {
  return (
    <>
      <p className="text-sm font-medium text-slate-800">{card.title}</p>
      {card.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {card.description}
        </p>
      )}
    </>
  )
}
