'use client'

import { useRouter } from 'next/navigation'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Deal {
  id: string
  title: string
  value: number
  stage: 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  description: string | null
  notes: string | null
  expected_close_date: string | null
  created_at: string
  updated_at: string
  stream_id: string
  user_id: string
  customer_id: string
}

const DEAL_STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400' },
  { id: 'contact', name: 'Contact', color: 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-50 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-400' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-400' },
] as const

interface CreateDealButtonProps {
  onDealCreated: (deal: Deal) => void
}

export function CreateDealButton({ onDealCreated }: CreateDealButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'lead' as const,
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    expectedCloseDate: '',
    notes: '',
    stream_id: ''
  })

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const { streamId } = useCurrentStream()

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Deal title is required')
    }
    
    const value = parseFloat(formData.value)
    if (isNaN(value) || value < 0) {
      throw new Error('Deal value must be a positive number')
    }

    if (!DEAL_STAGES.some(stage => stage.id === formData.stage)) {
      throw new Error('Invalid deal stage')
    }

    if (!formData.customerName.trim()) {
      throw new Error('Customer name is required')
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      throw new Error('Invalid email format')
    }

    if (formData.expectedCloseDate) {
      const date = new Date(formData.expectedCloseDate)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid close date')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      validateForm()

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!streamId) {
        throw new Error('Please select a revenue stream first')
      }
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: formData.customerName.trim(),
          email: formData.customerEmail || null,
          company: formData.customerCompany || null,
          user_id: user.id,
          status: 'lead',
          stream_id: streamId
        })
        .select()
        .single()

      if (customerError) throw customerError
      if (!customer) throw new Error('Failed to create customer')

      // Create deal
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          title: formData.title.trim(),
          value: parseFloat(formData.value),
          stage: formData.stage,
          customer_id: customer.id,
          stream_id: streamId,
          user_id: user.id,
          expected_close_date: formData.expectedCloseDate || null,
          notes: formData.notes.trim() || null
        })
        .select()
        .single()

      if (dealError) throw dealError
      if (!deal) throw new Error('Failed to create deal')

      // Reset form
      setFormData({
        title: '',
        value: '',
        stage: 'lead',
        customerName: '',
        customerEmail: '',
        customerCompany: '',
        expectedCloseDate: '',
        notes: '',
        stream_id: streamId
      })

      onDealCreated({
        ...deal,
        stage: deal.stage as Deal['stage']
      })
      setIsModalOpen(false)
      
      // Add a small delay then refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 100)
      
      toast.success('Deal created successfully')
    } catch (err) {
      console.error('Error creating deal:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>Create Deal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
          <DialogDescription>
            Add a new deal by filling in the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Deal Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Deal Value</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    id="value"
                    className="pl-7"
                    min="0"
                    step="0.01"
                    value={formData.value}
                    onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value as typeof formData.stage }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  type="email"
                  id="customerEmail"
                  value={formData.customerEmail}
                  onChange={e => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerCompany">Customer Company</Label>
                <Input
                  id="customerCompany"
                  value={formData.customerCompany}
                  onChange={e => setFormData(prev => ({ ...prev, customerCompany: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Expected Close Date and Notes */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                <Input
                  type="date"
                  id="expectedCloseDate"
                  value={formData.expectedCloseDate}
                  onChange={e => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
