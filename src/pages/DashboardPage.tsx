import { useState } from 'react'
import Navbar from '../components/Navbar'
import BoardTile from '../components/BoardTile'
import NewBoardModal from '../components/NewBoardModal'
import { BoardIcon, PlusIcon } from '../components/Icon'
import { useBoards } from '../hooks/useBoards'

export default function DashboardPage() {
  const { boards, loading, error, createBoard, deleteBoard } = useBoards()
  const [showNewBoard, setShowNewBoard] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Your boards</h1>
            <p className="mt-1 text-sm text-muted">
              Organize projects and track every task.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewBoard(true)}
            className="btn btn-primary"
          >
            <PlusIcon size={16} />
            New board
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading boards…</p>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-hair bg-surface p-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <BoardIcon size={26} />
            </span>
            <p className="mt-4 text-sm text-muted">
              No boards yet. Create your first project board to get started.
            </p>
            <button
              type="button"
              onClick={() => setShowNewBoard(true)}
              className="btn btn-primary mt-5"
            >
              <PlusIcon size={16} />
              New board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <BoardTile
                key={board.id}
                board={board}
                onDelete={deleteBoard}
              />
            ))}
          </div>
        )}
      </main>

      {showNewBoard && (
        <NewBoardModal
          onClose={() => setShowNewBoard(false)}
          onCreate={createBoard}
        />
      )}
    </div>
  )
}
