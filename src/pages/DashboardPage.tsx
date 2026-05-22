import { useState } from 'react'
import Navbar from '../components/Navbar'
import BoardTile from '../components/BoardTile'
import NewBoardModal from '../components/NewBoardModal'
import { useBoards } from '../hooks/useBoards'

export default function DashboardPage() {
  const { boards, loading, error, createBoard, deleteBoard } = useBoards()
  const [showNewBoard, setShowNewBoard] = useState(false)

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Your boards</h1>
          <button
            type="button"
            onClick={() => setShowNewBoard(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + New board
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-slate-400">Loading boards…</p>
        ) : boards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">
              No boards yet. Create your first project board to get started.
            </p>
            <button
              type="button"
              onClick={() => setShowNewBoard(true)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + New board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <BoardTile key={board.id} board={board} onDelete={deleteBoard} />
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
