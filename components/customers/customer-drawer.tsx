'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { format } from "date-fns"
import { Mail, Phone, MapPin, Building2, CalendarDays, DollarSign, FileText, Activity } from "lucide-react"

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

type Deal = Database['public']['Tables']['deals']['Row'] & {
  title: string
  value: number
  stage: string
}

type Customer = Database['public']['Tables']['customers']['Row'] & {
  deals?: Deal[]
  dealValue?: number
  dealsCount?: number
  company: string | null
  email: string | null
  status: string
  phone: string | null
  website: string | null
  industry: string | null
  linkedin: string | null
  annual_revenue: number | null
  employee_count: number | null
  last_contacted: string | null
  notes: string | null
  tags: string[]
  address: string | null
  lifetime_value: number | null
}

interface CustomerDrawerProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange?: (updatedCustomer: Customer) => void
}

export default function CustomerDrawer({ customer: initialCustomer, open, onOpenChange, onChange }: CustomerDrawerProps) {
  const [customer, setCustomer] = useState<Customer>(initialCustomer)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )


  useEffect(() => {
    if (initialCustomer) {
      setCustomer(initialCustomer)
      setIsEditing(false)
      setIsSaving(false)
    }
  }, [initialCustomer])

  const handleInputChange = (field: keyof Customer, value: any) => {
    setCustomer(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!customer) return
    try {
      setIsSaving(true)
      const updateData: any = {}

      // Only include fields that exist and have values
      if (customer.company !== undefined) updateData.company = customer.company
      if (customer.phone !== undefined) updateData.phone = customer.phone
      if (customer.website !== undefined) updateData.website = customer.website
      if (customer.industry !== undefined) updateData.industry = customer.industry
      if (customer.linkedin !== undefined) updateData.linkedin = customer.linkedin
      if (customer.annual_revenue !== undefined) updateData.annual_revenue = customer.annual_revenue
      if (customer.employee_count !== undefined) updateData.employee_count = customer.employee_count
      if (customer.last_contacted !== undefined) updateData.last_contacted = customer.last_contacted
      if (customer.notes !== undefined) updateData.notes = customer.notes
      if (customer.tags !== undefined) updateData.tags = customer.tags
      if (customer.address !== undefined) updateData.address = customer.address
      if (customer.lifetime_value !== undefined) updateData.lifetime_value = customer.lifetime_value

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customer.id)

      if (error) throw error

      toast.success('Customer information updated successfully')
      setIsEditing(false)
      onChange?.(customer)
      
      // Add a small delay then refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer information')
    } finally {
      setIsSaving(false)
    }
  }

  if (!customer) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-2.5 pb-4">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            {customer.name}
            <Badge 
              variant={customer.status === 'Active' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {customer.status}
            </Badge>
          </SheetTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {isEditing ? (
              <Input
                value={customer.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name"
                className="h-8"
              />
            ) : (
              customer.company || 'No company'
            )}
          </div>
        </SheetHeader>
        <div className="space-y-4 py-4 pb-6">
              <div className="flex justify-end mb-4 space-x-2">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setCustomer(initialCustomer)
                        setIsEditing(false)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={customer.name || ''} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input 
                    value={customer.company || ''} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={customer.email || ''} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={customer.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input 
                    value={customer.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input 
                    value={customer.industry || ''}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input 
                    value={customer.linkedin || ''}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Revenue</Label>
                  <Input 
                    type="number"
                    value={customer.annual_revenue || ''}
                    onChange={(e) => handleInputChange('annual_revenue', e.target.value ? parseInt(e.target.value) : null)}
                    readOnly={!isEditing}
                    placeholder={isEditing ? 'Enter amount in USD' : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employee Count</Label>
                  <Input 
                    type="number"
                    value={customer.employee_count || ''}
                    onChange={(e) => handleInputChange('employee_count', e.target.value ? parseInt(e.target.value) : null)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Contacted</Label>
                  <Input 
                    type="datetime-local"
                    value={customer.last_contacted ? new Date(customer.last_contacted).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('last_contacted', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input 
                    value={customer.status} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input 
                    value={customer.tags?.join(', ') || ''}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                    readOnly={!isEditing}
                    placeholder={isEditing ? 'Separate tags with commas' : undefined}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={customer.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  readOnly={!isEditing}
                  className="h-32"
                  placeholder={isEditing ? 'Enter notes about the customer' : undefined}
                />
              </div>
            </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${customer.phone}`} className="hover:underline">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{customer.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Customer Since</div>
                  <div className="text-sm flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    {format(new Date(customer.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Lifetime Value</div>
                  <div className="text-sm flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    ${customer.lifetime_value || '0'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Deals</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.deals && customer.deals.length > 0 ? (
                  <div className="text-sm space-y-2">
                    {customer.deals.map((deal: Deal) => (
                      <div key={deal.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{deal.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{deal.stage}</p>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          ${deal.value?.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span>Total Deal Value</span>
                        <span className="text-green-600 dark:text-green-400">
                          ${customer.deals.reduce((sum, deal) => sum + (deal.value || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No deals yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.notes ? (
                  <div className="text-sm space-y-2">
                    {customer.notes.split('\n').map((note: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
