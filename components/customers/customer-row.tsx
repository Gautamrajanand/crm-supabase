'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { useRouter } from 'next/navigation'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type CustomerStatus = 'active' | 'inactive' | 'lead'

type Customer = Database['public']['Tables']['customers']['Row'] & {
  deals?: Database['public']['Tables']['deals']['Row'][]
  dealValue?: number
  dealsCount?: number
  company: string | null
  email: string | null
  status: CustomerStatus
  notes: string | null
}

const statusStyles = {
  active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
  lead: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
}

export function CustomerRow({ customer }: { customer: Customer }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(customer.name)
  const [email, setEmail] = useState(customer.email || '')
  const [company, setCompany] = useState(customer.company || '')
  const [status, setStatus] = useState<CustomerStatus>(customer.status)
  const [notes, setNotes] = useState(customer.notes || '')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name,
          email,
          company,
          status,
          notes,
        })
        .eq('id', customer.id)

      if (error) throw error
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating customer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error deleting customer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <TableRow className="bg-accent/50">
        <TableCell colSpan={6} className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as CustomerStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className="hover:bg-accent/50 transition-colors">
      <TableCell>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <div className="font-medium">{name}</div>
            {notes && (
              <div className="text-sm text-muted-foreground line-clamp-1">{notes}</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {company || '-'}
      </TableCell>
      <TableCell className="font-medium">
        {email || '-'}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{formatCurrency(customer.dealValue || 0)}</span>
          <span className="text-xs text-muted-foreground">{customer.dealsCount} closed deals</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={cn(statusStyles[status])}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="mr-2"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive/90"
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}
