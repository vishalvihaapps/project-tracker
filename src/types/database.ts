// Shared data types for the project tracker.

export type CardStatus = 'todo' | 'in_progress' | 'complete' | 'archive'

export interface Board {
  id: string
  owner_id: string
  name: string
  description: string | null
  created_at: string
}

export interface Card {
  id: string
  board_id: string
  owner_id: string
  title: string
  description: string | null
  status: CardStatus
  position: number
  created_at: string
  updated_at: string
}

// The four fixed kanban columns, in display order.
// This single source of truth drives the board layout.
export const COLUMNS: { id: CardStatus; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'complete', label: 'Complete' },
  { id: 'archive', label: 'Archive' },
]
