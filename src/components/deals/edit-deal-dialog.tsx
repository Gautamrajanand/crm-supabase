'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { toast } from 'sonner'

interface EditDealDialogProps {
  deal: any
  open: boolean
  onClose: () => void
  onUpdate: (updatedDeal: any) => void
}

export function EditDealDialog({ deal, open, onClose, onUpdate }: EditDealDialogProps) {
  const [title, setTitle] = useState(deal.title)
  const [value, setValue] = useState(deal.value?.toString() || '')
  const [notes, setNotes] = useState(deal.notes || '')
  const [expectedCloseDate, setExpectedCloseDate] = useState(deal.expected_close_date || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createBrowserSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('deals')
        .update({
          title,
          value: parseFloat(value),
          notes,
          expected_close_date: expectedCloseDate || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id)
        .select('*, customers(*)')
        .single()

      if (error) throw error

      toast.success('Deal updated successfully')
      onUpdate(data)
      onClose()
      
      // Add a small delay then refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error updating deal:', error)
      toast.error('Failed to update deal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Deal</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
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
