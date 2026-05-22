import { useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card, CardStatus } from '../types/database'
import { CalendarIcon } from './Icon'

// Strip color reflects the card's real status (the same data as its column).
const STATUS_COLOR: Record<CardStatus, string> = {
  todo: '#60a5fa',
  in_progress: '#7c6af7',
  complete: '#34d399',
  archive: '#6b6877',
}

interface TaskCardProps {
  card: Card
  onClick?: () => void
  /** Position in the column — drives the stagger animation delay. */
  index?: number
  /** Renders the static preview shown inside the DragOverlay. */
  overlay?: boolean
}

export default function TaskCard({
  card,
  onClick,
  index = 0,
  overlay = false,
}: TaskCardProps) {
  const downAt = useRef<{ x: number; y: number } | null>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id })

  if (overlay) {
    return (
      <div className="kb-card kb-card--overlay">
        <span
          className="kb-strip"
          style={{ background: STATUS_COLOR[card.status] }}
        />
        <div className="kb-card__content">
          <CardBody card={card} />
        </div>
      </div>
    )
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    animationDelay: `${index * 80}ms`,
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
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
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
      className={`kb-card card-enter ${isDragging ? 'opacity-40' : ''}`}
    >
      <span
        className="kb-strip"
        style={{ background: STATUS_COLOR[card.status] }}
      />
      <div className="kb-card__content">
        <CardBody card={card} />
      </div>
    </div>
  )
}

function CardBody({ card }: { card: Card }) {
  return (
    <>
      <h3 className="break-words text-[14.5px] font-medium leading-snug">
        {card.title}
      </h3>
      {card.description && (
        <p className="mt-1.5 line-clamp-3 break-words text-xs leading-relaxed text-muted">
          {card.description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-1.5 border-t border-hair pt-2.5 text-[11px] text-dim">
        <CalendarIcon size={13} />
        {new Date(card.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </>
  )
}
