'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Board } from '@/components/board/board'

interface BoardEntry {
  id: string
  title: string
  description?: string
  priority: 'Low' | 'Medium' | 'High'
  revenue_potential?: number
  company?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  last_contacted?: string
  next_followup?: string
  column_id: string
  assigned_to_id?: string
  team_member?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
}

interface BoardColumn {
  id: string
  name: string
  board_id: string
  entries: BoardEntry[]
}

interface Board {
  id: string
  name: string
  type: string
  columns: BoardColumn[]
}

interface BoardContentProps {
  // Add any props that BoardContent component might receive
}

export default function BoardContent(props: BoardContentProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchBoardData()
  }, [])

  async function fetchBoardData() {
    try {
      setLoading(true)
      setError(null)

      // First, fetch boards
      const { data: boardsData, error: boardsError } = await supabase
        .from('boards')
        .select('*')
        .order('created_at')

      if (boardsError) throw boardsError

      // Then fetch columns for all boards
      const { data: columnsData, error: columnsError } = await supabase
        .from('board_columns')
        .select('*')
        .order('position')

      if (columnsError) throw columnsError

      // Finally, fetch entries with team member info
      const { data: entriesData, error: entriesError } = await supabase
        .from('board_entries')
        .select(`
          id,
          title,
          description,
          priority,
          revenue_potential,
          company,
          contact_name,
          contact_email,
          contact_phone,
          last_contacted,
          next_followup,
          column_id,
          assigned_to_id,
          team_member:team_members(
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at')

      if (entriesError) throw entriesError

      // Organize the data into a nested structure
      const organizedBoards = boardsData.map(board => ({
        ...board,
        columns: columnsData
          .filter(col => col.board_id === board.id)
          .map(col => ({
            ...col,
            entries: entriesData.filter(entry => entry.column_id === col.id)
          }))
      }))

      setBoards(organizedBoards)
    } catch (error) {
      console.error('Error fetching board data:', error)
      setError('Failed to load boards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEntryMove(entryId: string, fromColumnId: string, toColumnId: string) {
    try {
      const { error } = await supabase
        .from('board_entries')
        .update({ column_id: toColumnId })
        .eq('id', entryId)

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
          <h2 className="text-lg font-medium text-gray-900">{board.name}</h2>
          <Board
            columns={board.columns}
            onEntryMove={handleEntryMove}
          />
        </div>
      ))}
    </div>
  )
}
