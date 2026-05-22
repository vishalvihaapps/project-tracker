import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Board } from '../types/database'

/** Loads and mutates the signed-in user's boards. RLS scopes everything to them. */
export function useBoards() {
  const { user } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBoards = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setBoards(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  async function createBoard(name: string, description: string) {
    if (!user) return { error: 'Not signed in.' }
    const { data, error: insertError } = await supabase
      .from('boards')
      .insert({
        name,
        description: description.trim() || null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (insertError) return { error: insertError.message }
    setBoards((prev) => [data as Board, ...prev])
    return { error: null }
  }

  async function deleteBoard(id: string) {
    const previous = boards
    setBoards((prev) => prev.filter((b) => b.id !== id)) // optimistic
    const { error: deleteError } = await supabase
      .from('boards')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setBoards(previous) // revert on failure
      return { error: deleteError.message }
    }
    return { error: null }
  }

  return { boards, loading, error, createBoard, deleteBoard, refetch: fetchBoards }
}
