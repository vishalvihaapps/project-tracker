import { useState, type FormEvent } from 'react'
import Modal from './Modal'

interface NewBoardModalProps {
  onClose: () => void
  onCreate: (
    name: string,
    description: string,
  ) => Promise<{ error: string | null }>
}

export default function NewBoardModal({
  onClose,
  onCreate,
}: NewBoardModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)

    const { error: createError } = await onCreate(name.trim(), description)

    setSubmitting(false)
    if (createError) {
      setError(createError)
      return
    }
    onClose()
  }

  return (
    <Modal title="New project board" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Board name
          </label>
          <input
            autoFocus
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            placeholder="e.g. Website redesign"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Description <span className="text-dim">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="field resize-none"
            placeholder="What is this project about?"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Creating…' : 'Create board'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
