import type { Card, CardPriority, CardStatus } from '../types/database'
import { COLUMNS } from '../types/database'

/** The four kanban statuses, in display order. */
export const STATUSES: CardStatus[] = COLUMNS.map((c) => c.id)

/** True when an id string is one of the column statuses (rather than a card id). */
export function isStatus(id: string): id is CardStatus {
  return (STATUSES as string[]).includes(id)
}

export type Grouped = Record<CardStatus, Card[]>

// Lower rank = sorts earlier. Cards without a priority sort last.
const PRIORITY_RANK: Record<CardPriority, number> = { p1: 0, p2: 1, p3: 2 }
function priorityRank(p: CardPriority | null | undefined): number {
  return p ? PRIORITY_RANK[p] : 3
}

/**
 * Group cards into ordered columns by status. Each card is cloned so callers
 * can freely splice/mutate the result without touching the original objects.
 * Within a column, cards are sorted by priority (P1 → P2 → P3 → none),
 * then by their stored position as a tiebreaker.
 */
export function groupCards(cards: Card[]): Grouped {
  const grouped: Grouped = {
    todo: [],
    in_progress: [],
    complete: [],
    archive: [],
  }
  const sorted = [...cards].sort((a, b) => {
    const pd = priorityRank(a.priority) - priorityRank(b.priority)
    return pd !== 0 ? pd : a.position - b.position
  })
  for (const card of sorted) {
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
