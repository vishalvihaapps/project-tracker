import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BoardIcon } from '../components/Icon'

export default function LoginPage() {
  const { session, loading, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in — go straight to the dashboard.
  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const action = mode === 'signin' ? signIn : signUp
    const { error: actionError } = await action(email, password)

    setSubmitting(false)

    if (actionError) {
      setError(actionError)
      return
    }

    if (mode === 'signup') {
      // If email confirmation is enabled, there is no session yet.
      setInfo(
        'Account created. If sign-in does not happen automatically, check ' +
          'your email to confirm your address, then sign in.',
      )
      setMode('signin')
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
            <BoardIcon size={24} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">
            Project Tracker
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === 'signin'
              ? 'Sign in to your boards.'
              : 'Create an account to get started.'}
          </p>
        </div>

        <div className="kb-panel" style={{ maxWidth: 'none' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg border border-ok/20 bg-ok/10 px-3 py-2 text-sm text-ok">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting
                ? 'Please wait…'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === 'signin'
            ? "Don't have an account?"
            : 'Already registered?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setInfo(null)
            }}
            className="font-semibold text-accent hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
