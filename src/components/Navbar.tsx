import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <Link to="/" className="text-lg font-bold text-indigo-600">
        📋 Project Tracker
      </Link>
      <div className="flex items-center gap-4">
        {user && (
          <span className="hidden text-sm text-slate-500 sm:inline">
            {user.email}
          </span>
        )}
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
