'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Task = Database['public']['Tables']['tasks']['Row']

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: (task: Task) => void
}

export function EditTaskDialog({ task, open, onOpenChange, onTaskUpdated }: EditTaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

      const { error } = await supabase
        .from('tasks')
        .update({
          title: title.trim(),
          description: description?.trim() || null,
          due_date: dueDate || null,
          priority: priority || 'medium',
        })
        .eq('id', task.id)

      if (error) throw error

      const updatedTask = {
        ...task,
        title: title.trim(),
        description: description?.trim() || null,
        due_date: dueDate || null,
        priority: priority || 'medium',
      }
      toast.success('Task updated successfully')
      onOpenChange(false)
      onTaskUpdated(updatedTask)
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)

      if (error) throw error

      toast.success('Task deleted successfully')
      onOpenChange(false)
      onTaskUpdated(task)
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details or delete the task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={task.title}
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={task.description || ''}
              placeholder="Enter task description (optional)"
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              type="date"
              id="dueDate"
              name="dueDate"
              defaultValue={task.due_date?.split('T')[0] || undefined}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              name="priority"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={task.priority}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Task
            </Button>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
