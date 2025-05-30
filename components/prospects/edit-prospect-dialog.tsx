'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ProspectWithActivities } from '@/types/outreach'
import { toast } from 'sonner'

interface EditProspectDialogProps {
  prospect: ProspectWithActivities
  open: boolean
  onClose: () => void
  onUpdate: (updatedProspect: ProspectWithActivities) => void
}

export function EditProspectDialog({ prospect, open, onClose, onUpdate }: EditProspectDialogProps) {
  const [name, setName] = useState(prospect.name)
  const [company, setCompany] = useState(prospect.company || '')
  const [title, setTitle] = useState(prospect.title || '')
  const [email, setEmail] = useState(prospect.email || '')
  const [phone, setPhone] = useState(prospect.phone || '')
  const [notes, setNotes] = useState(prospect.notes || '')
  const [dealValue, setDealValue] = useState(prospect.deal_value?.toString() || '')
  const [website, setWebsite] = useState(prospect.website || '')
  const [linkedinUrl, setLinkedinUrl] = useState(prospect.linkedin_url || '')
  const [industry, setIndustry] = useState(prospect.industry || '')
  const [companySize, setCompanySize] = useState(prospect.company_size || '')
  const [source, setSource] = useState(prospect.source || '')
  const [priority, setPriority] = useState<string | null>(prospect.priority || null)
  const [addedBy, setAddedBy] = useState(prospect.added_by || '')
  const [assignedTo, setAssignedTo] = useState(prospect.assigned_to || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('prospects')
        .update({
          name,
          company,
          title,
          email,
          phone,
          notes,
          deal_value: dealValue ? parseFloat(dealValue) : null,
          website,
          linkedin_url: linkedinUrl,
          industry,
          company_size: companySize,
          source,
          priority: priority || null,
          added_by: addedBy,
          assigned_to: assignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', prospect.id)
        .select('*, activities(*)')
        .single()

      if (error) throw error

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
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Prospect</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-6">
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
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealValue">Deal Value</Label>
                <Input
                  id="dealValue"
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="added_by">Added By</Label>
                <Input
                  id="added_by"
                  value={addedBy}
                  onChange={(e) => setAddedBy(e.target.value)}
                  placeholder="Enter name of person who added this prospect"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Input
                  id="assigned_to"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter name of assigned person"
                />
              </div>
            </div>

            <Collapsible className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                Show Optional Fields
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Lead Source</Label>
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>


              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
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
