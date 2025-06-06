'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { CheckIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateTaskButton } from '@/components/tasks/create-task-button'
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog'
import { TaskStats } from '@/components/tasks/task-stats'
import { Database } from '@/types/database'
import { Spinner } from '@/components/ui/spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type Task = Database['public']['Tables']['tasks']['Row']

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const { stream, streamId, loading: streamLoading } = useCurrentStream()

  useEffect(() => {
    if (!streamId || streamLoading) {
      return
    }

    fetchTasks()

    // Clear tasks when unmounting or switching streams
    return () => {
      setTasks([])
      setLoading(true)
    }
  }, [streamId, streamLoading, router, supabase])

  async function fetchTasks() {
    try {
      if (!streamId) {
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('stream_id', streamId || '')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  async function toggleTaskCompletion(taskId: string, completed: boolean) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      ))

      toast.success(completed ? 'Task uncompleted' : 'Task completed')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  function getPriorityColor(priority: string | null) {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-400 ring-red-600/20 dark:ring-red-400/30'
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20 dark:ring-yellow-400/30'
      case 'low':
        return 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-400/30'
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 ring-gray-600/20 dark:ring-gray-400/30'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks and track their progress
          </p>
        </div>
        <CreateTaskButton onTaskCreated={(task) => setTasks(prev => [task, ...prev])} />
      </div>

      <TaskStats tasks={tasks} />

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>
            View and manage your tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="rounded-md border">
              <ul role="list" className="divide-y">
                {tasks.length === 0 ? (
                  <li className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No tasks yet. Create one to get started!</p>
                  </li>
                ) : (
                  tasks.map((task) => (
                    <li key={task.id} className="relative flex items-center space-x-4 px-4 py-4 hover:bg-accent/50 sm:px-6">
                      <div className="min-w-0 flex-auto">
                        <div className="flex items-center gap-x-3">
                          <button
                            onClick={() => toggleTaskCompletion(task.id, task.completed ?? false)}
                            className={`h-6 w-6 flex-none rounded-full ${
                              task.completed
                                ? 'bg-primary text-primary-foreground'
                                : 'border-2 border-input hover:border-primary'
                            }`}
                          >
                            {task.completed && <CheckIcon className="h-4 w-4 m-auto" />}
                          </button>
                          <h2 className={`min-w-0 text-sm font-semibold ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title ?? ''}
                          </h2>
                          <Badge variant="outline" className={getPriorityColor(task.priority ?? 'medium')}>
                            {task.priority ?? 'medium'}
                          </Badge>
                        </div>
                        {task.description && (
                          <div className="mt-1 truncate text-sm text-muted-foreground">
                            {task.description}
                          </div>
                        )}
                        {task.due_date && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex-none">
                            <EllipsisVerticalIcon className="h-5 w-5" />
                            <span className="sr-only">Open task menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTask(task)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingTask(null)
          }}
          onTaskUpdated={(updatedTask) => {
            setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task))
          }}
        />
      )}
    </div>
  )
}
