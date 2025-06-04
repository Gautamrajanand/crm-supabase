'use client'

import { useRouter } from 'next/navigation'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']

type CreateTaskButtonProps = {
  onTaskCreated?: (task: Task) => void
}

export function CreateTaskButton({ onTaskCreated }: CreateTaskButtonProps) {
  const router = useRouter()
  const { streamId } = useCurrentStream()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const dueDate = formData.get('dueDate') as string
      const priority = formData.get('priority') as 'low' | 'medium' | 'high'

      if (!title?.trim()) {
        throw new Error('Title is required')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      console.log('Creating task with data:', {
        title: title.trim(),
        description: description?.trim() || null,
        due_date: dueDate || null,
        priority: priority || 'medium',
        completed: false,
        user_id: user.id,
      })

      if (!streamId) {
        toast.error('Please select a revenue stream first')
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: title.trim(),
          description: description?.trim() || null,
          due_date: dueDate || null,
          priority: priority || 'medium',
          completed: false,
          user_id: user.id,
          stream_id: streamId,
        }])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned from insert')
      }

      console.log('Task created:', data)
      toast.success('Task created successfully')
      setOpen(false)
      if (onTaskCreated) {
        onTaskCreated(data)
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task with title, description, due date, and priority.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter task description (optional)"
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              type="date"
              id="dueDate"
              name="dueDate"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              name="priority"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="medium"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
