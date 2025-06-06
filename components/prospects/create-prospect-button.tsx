'use client'

import { useState, useRef } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { useRouter } from 'next/navigation'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { toast } from 'sonner'

export function CreateProspectButton() {
  const [open, setOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const { streamId } = useCurrentStream()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (!streamId) {
        toast.error('Please select a revenue stream first')
        return
      }
      
      if (userError || !user) {
        toast.error('Authentication error. Please try logging in again.')
        return
      }

      // Get form data
      const form = formRef.current
      if (!form) {
        toast.error('Form not found')
        return
      }

      const formData = new FormData(form)
      
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const company = formData.get('company') as string
      const title = formData.get('title') as string

      // Validate required fields
      if (!name || !email || !company || !title) {
        toast.error('Name, email, company and title are required')
        return
      }

      const prospectData: Database['public']['Tables']['prospects']['Insert'] = {
        name,
        email,
        company,
        title,
        phone: formData.get('phone') as string || null,
        notes: formData.get('notes') as string || null,
        status: 'new',
        stream_id: streamId,
        user_id: user.id,
        deal_value: parseFloat(formData.get('deal_value') as string) || 0
      }

      // Validate deal value
      const value = parseFloat(formData.get('deal_value') as string)
      if (isNaN(value) || value < 0) {
        toast.error('Deal value must be a positive number')
        return
      }

      // Insert prospect
      const { error: insertError } = await supabase
        .from('prospects')
        .insert(prospectData)
        .select()

      if (insertError) {
        console.error('Error creating prospect:', insertError)
        if (insertError.code === '23505') {
          toast.error('A prospect with this email already exists')
        } else if (insertError.code === '42501') {
          toast.error('You do not have permission to create prospects')
        } else {
          toast.error(insertError.message || 'Failed to create prospect')
        }
        return
      }

      toast.success('Prospect created successfully')
      form.reset()
      setOpen(false)
      
      // Add a small delay then refresh while preserving the stream
      setTimeout(() => {
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('stream', streamId)
        window.location.href = currentUrl.toString()
      }, 100)
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Prospect</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Prospect</DialogTitle>
          <DialogDescription>
            Add a new prospect to your outreach list. Fill in as much information as you have.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input id="website" name="website" type="url" placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL (optional)</Label>
              <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input id="website" name="website" type="url" placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL (optional)</Label>
              <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal_value">Expected Deal Value</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input 
                  id="deal_value" 
                  name="deal_value" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  className="pl-7"
                  defaultValue="0"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry (optional)</Label>
              <Input id="industry" name="industry" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size (optional)</Label>
              <Select name="company_size">
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" name="notes" />
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
              {loading ? 'Adding...' : 'Add Prospect'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
