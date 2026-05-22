import { useNavigate } from 'react-router-dom'
import { BoardIcon, CalendarIcon, TrashIcon } from './Icon'
import type { Board } from '../types/database'

interface BoardTileProps {
  board: Board
  onDelete: (id: string) => void
}

const PALETTE = ['#7c6af7', '#60a5fa', '#34d399', '#fbbf24', '#f87171']

export default function BoardTile({ board, onDelete }: BoardTileProps) {
  const navigate = useNavigate()
  // Stable accent per board, derived from its id — purely cosmetic.
  const color =
    PALETTE[(board.id.charCodeAt(0) + board.name.length) % PALETTE.length]

  return (
    <div
      onClick={() => navigate(`/board/${board.id}`)}
      className="kb-card group"
      style={{ cursor: 'pointer' }}
    >
      <div className="kb-card__content">
        <div className="flex items-start justify-between">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${color}1f`, color }}
          >
            <BoardIcon size={19} />
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (
                confirm(
                  `Delete "${board.name}"? This removes the board and all its cards.`,
                )
              ) {
                onDelete(board.id)
              }
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-dim opacity-0 transition duration-200 ease-smooth hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
            aria-label="Delete board"
          >
            <TrashIcon size={15} />
          </button>
        </div>

        <h3 className="mt-3.5 break-words text-base font-bold">
          {board.name}
        </h3>
        {board.description && (
          <p className="mt-1.5 line-clamp-2 break-words text-sm text-muted">
            {board.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-xs text-dim">
          <CalendarIcon size={13} />
          Created {new Date(board.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
