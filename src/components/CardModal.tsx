import { useState, type FormEvent } from 'react'
import Modal from './Modal'
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
      title={isEdit ? 'Edit card' : `Add card to ${columnLabel}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="What needs doing?"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Add more detail…"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? 'Saving…' : isEdit ? 'Save' : 'Add card'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
