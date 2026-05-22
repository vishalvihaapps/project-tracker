import type { Card, CardStatus } from '../types/database'
import { COLUMNS } from '../types/database'

/** The four kanban statuses, in display order. */
export const STATUSES: CardStatus[] = COLUMNS.map((c) => c.id)

/** True when an id string is one of the column statuses (rather than a card id). */
export function isStatus(id: string): id is CardStatus {
  return (STATUSES as string[]).includes(id)
}

export type Grouped = Record<CardStatus, Card[]>

/**
 * Group cards into ordered columns by status. Each card is cloned so callers
 * can freely splice/mutate the result without touching the original objects.
 */
export function groupCards(cards: Card[]): Grouped {
  const grouped: Grouped = {
    todo: [],
    in_progress: [],
    complete: [],
    archive: [],
  }
  for (const card of [...cards].sort((a, b) => a.position - b.position)) {
    grouped[card.status].push({ ...card })
  }
  return grouped
}

/**
 * Flatten grouped columns back to a flat list, normalizing each card's
 * `status` and `position` to match its place in the columns.
 */
export function flattenGroups(grouped: Grouped): Card[] {
  const flat: Card[] = []
  for (const status of STATUSES) {
    grouped[status].forEach((card, index) => {
      flat.push({ ...card, status, position: index })
    })
  }
  return flat
}
