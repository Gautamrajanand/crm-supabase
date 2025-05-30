'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusIcon } from '@heroicons/react/24/outline'

interface CreateBoardDialogProps {
  onBoardCreated: () => void
}

export function CreateBoardDialog({ onBoardCreated }: CreateBoardDialogProps) {
  const router = useRouter()
  const { streamId: currentStreamId } = useCurrentStream()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      // First, create the board
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert([{ name, type: 'sales', stream_id: currentStreamId }])
        .select()
        .single()

      if (boardError) throw boardError

      // Then, create default columns
      const defaultColumns = [
        { name: 'Lead', position: 0 },
        { name: 'Contact Made', position: 1 },
        { name: 'Meeting Scheduled', position: 2 },
        { name: 'Proposal Sent', position: 3 },
        { name: 'Negotiation', position: 4 },
        { name: 'Won', position: 5 },
      ]

      const { data: { user } } = await supabase.auth.getUser()

      if (!currentStreamId) {
        // toast.error('Please select a revenue stream first')
        setError('Please select a revenue stream first')
        return
      }

      const { error: columnsError } = await supabase
        .from('board_columns')
        .insert(
          defaultColumns.map(col => ({
            name: col.name,
            position: col.position,
            board_id: board.id,
            user_id: user?.id,
            stream_id: currentStreamId
          }))
        )

      if (columnsError) throw columnsError

      setOpen(false)
      setName('')
      onBoardCreated()
    } catch (error) {
      console.error('Error creating board:', error)
      setError('Failed to create board. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Board
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Create a new board to track your leads and opportunities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Board Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sales Pipeline"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
