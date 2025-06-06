'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { Board } from '@/components/board/board'

interface BoardEntry {
  id: number
  title: string
  description?: string | null
  priority: string | null
  revenue_potential?: number | null
  company?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  last_contacted?: string | null
  next_followup?: string | null
  column_id: number
  assigned_to?: number | null
  team_member?: {
    id: number
    full_name: string
    avatar_url?: string | null
  } | null
}

interface BoardColumn {
  id: number
  name: string
  board_id: number | null
  position: number
  entries: BoardEntry[]
}

interface Board {
  id: number
  title: string
  columns: BoardColumn[]
}

interface BoardContentProps {
  // Add any props that BoardContent component might receive
}

export default function BoardContent(props: BoardContentProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchBoardData()
  }, [])

  async function fetchBoardData() {
    try {
      setLoading(true)
      setError(null)

      // First, fetch boards
      const { data: boardsData, error: boardsError } = await supabase
        .from('board')
        .select('*')
        .order('id')

      if (boardsError) throw boardsError

      // Then fetch columns for all boards
      const { data: columnsData, error: columnsError } = await supabase
        .from('board_column')
        .select('*')
        .order('position')

      if (columnsError) throw columnsError

      // Finally, fetch entries with team member info
      const { data: entriesData, error: entriesError } = await supabase
        .from('board_entrie')
        .select('*')
        .order('id')

      if (entriesError) throw entriesError

      // Organize the data into a nested structure
      const boardsWithData = (boardsData || []).map((board: any) => ({
        ...board,
        columns: columnsData
          .filter(col => col.board_id === board.id)
          .map(col => ({
            ...col,
            entries: entriesData.filter(entry => entry.column_id === col.id)
          }))
      }))

      setBoards(boardsWithData as any)
    } catch (error) {
      console.error('Error fetching board data:', error)
      setError('Failed to load boards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEntryMove(entryId: string, fromColumnId: string, toColumnId: string) {
    const numericEntryId = parseInt(entryId)
    const numericFromColumnId = parseInt(fromColumnId)
    const numericToColumnId = parseInt(toColumnId)
    try {
      const { error } = await supabase
        .from('board_entrie')
        .update({ column_id: numericToColumnId })
        .eq('id', numericEntryId)

      if (error) throw error

      // Refresh board data after successful update
      fetchBoardData()
    } catch (error) {
      console.error('Error updating entry:', error)
      setError('Failed to update entry. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 py-4">{error}</div>
    )
  }

  return (
    <div className="space-y-8">
      {boards.map(board => (
        <div key={board.id} className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">{board.title}</h2>
          <Board
            columns={board.columns.map(col => ({
              ...col,
              id: col.id.toString(),
              entries: col.entries.map(entry => ({
                ...entry,
                id: entry.id.toString()
              }))
            }))}
            onEntryMove={handleEntryMove}
          />
        </div>
      ))}
    </div>
  )
}
