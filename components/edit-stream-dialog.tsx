'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { toast } from 'sonner'

interface EditStreamDialogProps {
  stream: {
    id: string
    name: string
    description: string | null
  }
  open: boolean
  onClose: () => void
  onUpdate: (updatedStream: any) => void
}

export function EditStreamDialog({ stream, open, onClose, onUpdate }: EditStreamDialogProps) {
  const [name, setName] = useState(stream.name)
  const [description, setDescription] = useState(stream.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('revenue_streams')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', stream.id)
        .select('id, name, description, created_at, updated_at, workspace_id')
        .single()

      if (error) throw error

      toast.success('Revenue stream updated successfully')
      onUpdate(data)
      onClose()

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('stream-name-changed'))
    } catch (error) {
      console.error('Error updating revenue stream:', error)
      toast.error('Failed to update revenue stream')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Revenue Stream</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
