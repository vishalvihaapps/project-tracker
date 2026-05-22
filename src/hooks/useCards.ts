import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Card, CardStatus } from '../types/database'

/**
 * Loads and mutates the cards for one board. Keeps a flat `cards` array as the
 * source of truth, exposes CRUD helpers, and persists drag-and-drop layout
 * changes. Subscribes to Supabase Realtime so the board stays live.
 */
export function useCards(boardId: string | undefined) {
  const { user } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mirror of `cards` for reading the latest value inside event handlers.
  const cardsRef = useRef<Card[]>([])
  useEffect(() => {
    cardsRef.current = cards
  }, [cards])

  const fetchCards = useCallback(async () => {
    if (!boardId) return
    const { data, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('status', { ascending: true })
      .order('position', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCards(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [boardId])

  useEffect(() => {
    setLoading(true)
    fetchCards()
  }, [fetchCards])

  // Realtime: refetch when this board's cards change anywhere.
  useEffect(() => {
    if (!boardId) return
    const channel = supabase
      .channel(`cards-${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `board_id=eq.${boardId}`,
        },
        () => fetchCards(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [boardId, fetchCards])

  async function createCard(
    status: CardStatus,
    title: string,
    description: string,
  ) {
    if (!boardId || !user) return { error: 'Not ready.' }
    const position = cardsRef.current.filter((c) => c.status === status).length
    const { data, error: insertError } = await supabase
      .from('cards')
      .insert({
        board_id: boardId,
        owner_id: user.id,
        title,
        description: description.trim() || null,
        status,
        position,
      })
      .select()
      .single()

    if (insertError) return { error: insertError.message }
    setCards((prev) => [...prev, data as Card])
    return { error: null }
  }

  async function updateCard(
    id: string,
    fields: { title?: string; description?: string | null },
  ) {
    const { data, error: updateError } = await supabase
      .from('cards')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (updateError) return { error: updateError.message }
    setCards((prev) => prev.map((c) => (c.id === id ? (data as Card) : c)))
    return { error: null }
  }

  async function deleteCard(id: string) {
    const previous = cardsRef.current
    setCards((prev) => prev.filter((c) => c.id !== id)) // optimistic
    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setCards(previous) // revert
      return { error: deleteError.message }
    }
    return { error: null }
  }

  /**
   * Persist a drag-and-drop result: writes only the cards whose status or
   * position changed compared with the snapshot taken when the drag started.
   */
  async function saveLayout(updated: Card[], snapshot: Card[]) {
    const before = new Map(snapshot.map((c) => [c.id, c]))
    const changed = updated.filter((c) => {
      const old = before.get(c.id)
      return !old || old.status !== c.status || old.position !== c.position
    })
    if (changed.length === 0) return { error: null }

    const results = await Promise.all(
      changed.map((c) =>
        supabase
          .from('cards')
          .update({ status: c.status, position: c.position })
          .eq('id', c.id),
      ),
    )
    const failed = results.find((r) => r.error)
    return { error: failed?.error?.message ?? null }
  }

  return {
    cards,
    setCards,
    cardsRef,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    saveLayout,
  }
}
