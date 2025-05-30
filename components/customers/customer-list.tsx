'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Database } from '@/types/database'
import { useCustomerDrawer } from '@/context/customer-drawer-context'

type Deal = Database['public']['Tables']['deals']['Row']

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

type SortableFields = 'name' | 'company' | 'email' | 'created_at' | 'status' | 'dealValue'
type SortOrder = 'asc' | 'desc'

interface SortButtonProps {
  field: SortableFields
  currentField: SortableFields
  currentOrder: SortOrder
  onSort: (field: SortableFields) => void
  children: React.ReactNode
}

const SortButton = memo(({ field, currentField, currentOrder, onSort, children }: SortButtonProps) => (
  <Button
    variant="ghost"
    onClick={() => onSort(field)}
    className="-ml-4 hover:bg-transparent"
  >
    {children}
    <ArrowUpDown className={cn(
      'ml-2 h-4 w-4',
      field === currentField ? 'opacity-100' : 'opacity-40'
    )} />
  </Button>
))

interface CustomerListProps {
  streamId: string | null
}

export default function CustomerList({ streamId }: CustomerListProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortableFields>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { openCustomerDrawer } = useCustomerDrawer()

  const fetchCustomers = useCallback(async () => {
    if (!streamId) return
    
    try {
      setLoading(true)
      // First get all deals that are closed won for this stream
      const { data: closedWonDeals } = await supabase
        .from('deals')
        .select('customer_id')
        .eq('stage', 'closed_won')
        .eq('stream_id', streamId)

      // Get unique customer IDs from closed won deals
      const customerIds = [...new Set(closedWonDeals?.filter(deal => deal.customer_id).map(deal => deal.customer_id as string) || [])]

      // Then get only the customers with closed won deals
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          deals (id, value, stage)
        `)
        .eq('stream_id', streamId)
        .in('id', customerIds)
        .order(sortField === 'dealValue' ? 'created_at' : sortField, { ascending: sortOrder === 'asc' })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [streamId, sortField, sortOrder, supabase])

  useEffect(() => {
    fetchCustomers()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('customer-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'customers',
          filter: streamId ? `stream_id=eq.${streamId}` : undefined
        }, 
        async (payload) => {
          console.log('Customer changed:', payload)
          // Refresh the entire list to get the latest data
          await fetchCustomers()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      setCustomers([])
      setLoading(false)
    }
  }, [fetchCustomers, streamId, supabase])

  const handleDelete = async (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation() // Prevent opening the drawer
    
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id)

      if (error) throw error

      toast.success('Customer deleted successfully')
      // Add a small delay then refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  const handleEdit = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation() // Prevent opening the drawer
    openCustomerDrawer({
      ...customer,
      dealValue: customer.deals?.filter((deal: any) => deal.stage === 'closed_won').reduce((sum, deal) => sum + (deal.value || 0), 0) || 0
    })
  }

  const handleSort = useCallback((field: SortableFields) => {
    if (field === sortField) {
      setSortOrder(order => order === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }, [sortField])

  const filteredCustomers = useMemo(() => customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortField === 'dealValue') {
      const aValue = a.deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0
      const bValue = b.deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }

    const aValue = String(a[sortField] || '').toLowerCase()
    const bValue = String(b[sortField] || '').toLowerCase()
    return sortOrder === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  }), [customers, searchQuery, sortField, sortOrder])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton
                  field="name"
                  currentField={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                >
                  Name
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton
                  field="company"
                  currentField={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                >
                  Company
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton
                  field="email"
                  currentField={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                >
                  Email
                </SortButton>
              </TableHead>
              <TableHead>
                <Badge
                  className={cn(
                    'cursor-pointer',
                    sortField === 'dealValue' && 'bg-primary'
                  )}
                  onClick={() => handleSort('dealValue')}
                >
                  Deal Value
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Badge>
              </TableHead>
              <TableHead>
                <SortButton
                  field="status"
                  currentField={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                >
                  Status
                </SortButton>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="h-12 w-12 text-muted-foreground/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mt-2 font-medium">No customers found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new customer'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    openCustomerDrawer({
                      ...customer,
                      dealValue: customer.deals?.filter((deal: any) => deal.stage === 'closed_won').reduce((sum, deal) => sum + (deal.value || 0), 0) || 0
                    })
                  }}
                >
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.company}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    {formatCurrency(customer.deals?.filter((deal: any) => deal.stage === 'closed_won').reduce((sum: number, deal: { value?: number }) => sum + (deal.value || 0), 0) || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                      Closed Won
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEdit(e, customer)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, customer)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  )
}
