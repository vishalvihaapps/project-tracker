import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import { TrashIcon } from './Icon'
import { COLUMNS } from '../types/database'
import type { Card, CardStatus } from '../types/database'

export type CardModalState =
  | { mode: 'create'; status: CardStatus }
  | { mode: 'edit'; card: Card }

interface CardModalProps {
  state: CardModalState
  onClose: () => void
  onCreate: (
    status: CardStatus,
    title: string,
    description: string,
  ) => Promise<{ error: string | null }>
  onUpdate: (
    id: string,
    fields: { title: string; description: string | null },
  ) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
}

export default function CardModal({
  state,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: CardModalProps) {
  const isEdit = state.mode === 'edit'
  const [title, setTitle] = useState(isEdit ? state.card.title : '')
  const [description, setDescription] = useState(
    isEdit ? (state.card.description ?? '') : '',
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const columnLabel = COLUMNS.find(
    (c) => c.id === (isEdit ? state.card.status : state.status),
  )?.label

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    setError(null)

    const result = isEdit
      ? await onUpdate(state.card.id, {
          title: title.trim(),
          description: description.trim() || null,
        })
      : await onCreate(state.status, title.trim(), description)

    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onClose()
  }

  async function handleDelete() {
    if (!isEdit) return
    if (!confirm('Delete this card?')) return
    setBusy(true)
    setError(null)
    const { error: delError } = await onDelete(state.card.id)
    setBusy(false)
    if (delError) {
      setError(delError)
      return
    }
    onClose()
  }

  return (
    <Modal
      title={isEdit ? 'Edit card' : `Add card · ${columnLabel}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Title
          </label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
            placeholder="What needs doing?"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Description <span className="text-dim">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="field resize-none"
            placeholder="Add more detail…"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="btn btn-danger"
            >
              <TrashIcon size={15} />
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add card'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
