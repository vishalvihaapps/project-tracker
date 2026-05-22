import { useNavigate } from 'react-router-dom'
import type { Board } from '../types/database'

interface BoardTileProps {
  board: Board
  onDelete: (id: string) => void
}

export default function BoardTile({ board, onDelete }: BoardTileProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/board/${board.id}`)}
      className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800">{board.name}</h3>
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
          className="opacity-0 transition group-hover:opacity-100 text-slate-300 hover:text-red-500"
          aria-label="Delete board"
        >
          ✕
        </button>
      </div>
      {board.description && (
        <p className="mt-2 line-clamp-3 text-sm text-slate-500">
          {board.description}
        </p>
      )}
      <p className="mt-4 text-xs text-slate-400">
        Created {new Date(board.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}
