import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BoardIcon, MoonIcon, SignOutIcon, SunIcon } from './Icon'

/** Toggles the light/dark theme; the choice persists in localStorage. */
function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  )

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="icon-btn"
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  )
}

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between gap-3 border-b border-hair px-6 py-3">
      <Link to="/" className="flex shrink-0 items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
          <BoardIcon size={17} />
        </span>
        <span className="text-[15px] font-bold tracking-tight">
          Project Tracker
        </span>
      </Link>
      <div className="flex min-w-0 items-center gap-2.5">
        {user && (
          <span className="hidden max-w-[220px] truncate text-[13px] text-muted sm:inline-block">
            {user.email}
          </span>
        )}
        <ThemeToggle />
        <button type="button" onClick={signOut} className="btn shrink-0">
          <SignOutIcon size={15} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
