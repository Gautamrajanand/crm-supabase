'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { DialogContent } from '@/components/ui/dialog'
import { DialogHeader } from '@/components/ui/dialog'
import { DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { toast } from 'sonner'

type ProspectWithActivities = Database['public']['Tables']['prospects']['Row'] & {
  activities: Database['public']['Tables']['activities']['Row'][]
}

type EditProspectDialogProps = {
  prospect: ProspectWithActivities
  isOpen: boolean
  onClose: () => void
  onUpdate: (prospect: ProspectWithActivities) => void
}

export function EditProspectDialog({ prospect, isOpen, onClose, onUpdate }: EditProspectDialogProps) {
  const [name, setName] = useState(prospect.name || '')
  const [company, setCompany] = useState(prospect.company || '')
  const [title, setTitle] = useState(prospect.title || '')
  const [email, setEmail] = useState(prospect.email || '')
  const [phone, setPhone] = useState(prospect.phone || '')
  const [notes, setNotes] = useState(prospect.notes || '')
  const [dealValue, setDealValue] = useState(prospect.deal_value?.toString() || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const updatedData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string,
        title: formData.get('title') as string,
        phone: formData.get('phone') as string || null,
        notes: formData.get('notes') as string || null,
        deal_value: parseFloat(formData.get('deal_value') as string) || 0
      }

      const { data, error } = await supabase
        .from('prospects')
        .update(updatedData)
        .eq('id', prospect.id)
        .select('*, activities(*)')
        .single()

      if (error) {
        console.error('Error updating prospect:', error)
        toast.error('Failed to update prospect')
        return
      }

      toast.success('Prospect updated successfully')
      onUpdate(data as ProspectWithActivities)
      onClose()
    } catch (error) {
      console.error('Error updating prospect:', error)
      toast.error('Failed to update prospect')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Prospect</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal_value">Deal Value</Label>
              <Input
                id="deal_value"
                name="deal_value"
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this prospect"
              />
            </div>


          </div>
          <div className="flex justify-end space-x-2">
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
      </DialogContent>
    </Dialog>
  )
}
