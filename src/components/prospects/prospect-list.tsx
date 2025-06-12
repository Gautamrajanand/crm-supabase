'use client'

import { useState } from 'react'
import { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row'] & {
  dealValue?: number
  tags?: string[]
  deals?: any[]
  dealsCount?: number
  status: string
}

type ProspectWithActivities = Database['public']['Tables']['prospects']['Row'] & {
  activities: Database['public']['Tables']['activities']['Row'][]
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { EditProspectDialog } from './edit-prospect-dialog'
import { useCustomerDrawer } from '@/context/customer-drawer-context'

const statusColors = {
  new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  contacted: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  qualified: 'bg-green-50 text-green-700 ring-green-600/20',
  disqualified: 'bg-gray-50 text-gray-700 ring-gray-600/20',
}

type SortableField = keyof Pick<ProspectWithActivities, 'name' | 'company' | 'status' | 'created_at' | 'deal_value'>

export function ProspectList({ prospects: initialProspects }: { prospects: ProspectWithActivities[] }) {
  if (!initialProspects?.length) return null
  const [prospects, setProspects] = useState(initialProspects)
  const [selectedProspect, setSelectedProspect] = useState<ProspectWithActivities | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortableField>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { streamId: currentStreamId } = useCurrentStream()

  const handleProspectUpdate = async (updatedProspect: ProspectWithActivities) => {
    setProspects(prospects.map(p => p.id === updatedProspect.id ? updatedProspect : p))
    setSelectedProspect(null)
    setIsEditDialogOpen(false)
    router.refresh()
  }
  const { openDrawer: openCustomerDrawer } = useCustomerDrawer()

  const handleSort = (field: SortableField) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedProspects = [...prospects].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? -1 : 1
    if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? 1 : -1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleDelete = async (prospect: ProspectWithActivities) => {
    if (!confirm('Are you sure you want to delete this prospect?')) return

    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', prospect.id)

      if (error) throw error

      const handleUpdate = (updatedProspect: ProspectWithActivities) => {
        setProspects(prospects.map(p => p.id === updatedProspect.id ? updatedProspect : p))
      }

      handleUpdate({ ...prospect, status: 'deleted' })
      toast.success('Prospect deleted successfully')
    } catch (error) {
      console.error('Error deleting prospect:', error)
      toast.error('Failed to delete prospect')
    }
  }

  const handleUpdate = (updatedProspect: ProspectWithActivities) => {
    // Update the local state
    setProspects(prospects.map(p => 
      p.id === updatedProspect.id 
        ? { ...p, status: 'qualified' } 
        : p
    ))
  }

  const handleQualify = async (prospect: ProspectWithActivities) => {
    if (!confirm('Are you sure you want to qualify this prospect? This will create a new lead.')) {
      return
    }

    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error('Authentication error. Please try logging in again.')
        return
      }

      if (!currentStreamId) {
        toast.error('Please select a revenue stream first')
        return
      }

      // First update prospect status
      const { error: prospectError } = await supabase
        .from('prospects')
        .update({ status: 'qualified' })
        .eq('id', prospect.id)

      if (prospectError) {
        console.error('Error updating prospect:', prospectError)
        toast.error('Failed to update prospect status')
        return
      }

      // Then create a new customer as a lead
      if (!currentStreamId || typeof currentStreamId !== 'string') {
        toast.error('Please select a revenue stream first');
        setLoading(false);
        return;
      }
      const streamId = currentStreamId;
      const customerData = {
        name: prospect.name,
        email: prospect.email,
        company: prospect.company,
        status: 'lead',
        notes: prospect.notes,
        user_id: user.id,
        phone: prospect.phone || null,
        stream_id: streamId
      }

      console.log('Creating customer with data:', customerData)

      // Create the customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (customerError) {
        console.error('Error creating customer:', customerError)
        toast.error(`Failed to create customer: ${customerError.message}`)
        return
      }

      if (!newCustomer) {
        console.error('No customer data returned')
        toast.error('Failed to create customer: No data returned')
        return
      }

      // Create an initial deal
      const dealData = {
        title: `${prospect.company} - Initial Contact`,
        stage: 'lead',
        customer_id: newCustomer.id,
        user_id: user.id,
        value: prospect.deal_value || 0,
        description: `Qualified from prospect: ${prospect.notes || 'No notes'}`,
        stream_id: streamId
      }

      console.log('Creating deal with data:', dealData)

      const { error: dealError } = await supabase
        .from('deals')
        .insert([dealData])

      if (dealError) {
        console.error('Error creating deal:', dealError)
        if (dealError.code === '23505') {
          toast.error('Failed to create deal: Deal already exists')
        } else {
          toast.error(`Failed to create deal: ${dealError.message}`)
        }
        return
      }

      // Fetch the complete customer with deals
      const { data: customerWithDeals, error: fetchError } = await supabase
        .from('customers')
        .select(`
          *,
          deals(*)
        `)
        .eq('id', newCustomer.id)
        .single()

      if (fetchError || !customerWithDeals) {
        console.error('Error fetching customer:', fetchError)
        toast.error('Failed to open customer drawer')
        return
      }

      // Format customer data for drawer
      const customerForDrawer = {
        ...customerWithDeals,
        deals: customerWithDeals.deals || [],
        dealValue: customerWithDeals.deals?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0,
        dealsCount: customerWithDeals.deals?.length || 0,
        tags: customerWithDeals.tags || [],
        status: 'lead'
      }

      // Open the drawer with complete customer data
      openCustomerDrawer(customerForDrawer)

      toast.success('Prospect qualified successfully')
      router.refresh()
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-x-auto">
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>Name</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('company')}>Company</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('deal_value')}>Deal Value</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>Created</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProspects.map((prospect) => (
            <TableRow key={prospect.id}>
              <TableCell 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={async () => {
                  try {
                  const { data: customerData, error } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('id', prospect.id)
                    .single()

                  if (error) throw error

                  if (customerData) {
                    const customer = {
                      id: customerData.id,
                      name: customerData.name,
                      email: customerData.email,
                      company: customerData.company,
                      phone: customerData.phone,
                      created_at: customerData.created_at || new Date().toISOString(),
                      updated_at: customerData.updated_at || new Date().toISOString(),
                      stream_id: currentStreamId || '',
                      user_id: customerData.user_id || prospect.user_id,
                      address: customerData.address || null,
                      annual_revenue: customerData.annual_revenue || null,
                      employee_count: customerData.employee_count || null,
                      industry: customerData.industry || null,
                      website: customerData.website || null,
                      last_contacted: customerData.last_contacted || null,
                      lifetime_value: customerData.lifetime_value || null,
                      linkedin: customerData.linkedin || null,
                      notes: customerData.notes || null,
                      status: 'lead',
                      deals: [],
                      dealsCount: 0,
                      dealValue: 0,
                      tags: []
                    } satisfies Customer
                    openCustomerDrawer(customer)
                  }
                } catch (err) {
                  console.error('Error opening customer drawer:', err)
                  toast.error('Failed to open customer drawer')
                }
                }}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">{prospect.name}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{prospect.company}</div>
              </TableCell>
              <TableCell>{prospect.title}</TableCell>
              <TableCell>
                <div>{prospect.email}</div>
                {prospect.phone && <div className="text-sm text-gray-500">{prospect.phone}</div>}
              </TableCell>
              <TableCell>
                <span className="text-gray-500">-</span>
              </TableCell>
              <TableCell>
                {prospect.deal_value ? (
                  <span className="font-medium">${prospect.deal_value.toLocaleString()}</span>
                ) : (
                  <span className="text-gray-500">$0</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[prospect.status as keyof typeof statusColors]}
                >
                  {prospect.status}
                </Badge>
              </TableCell>
              <TableCell>
                {prospect.created_at ? new Date(prospect.created_at).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                {prospect.user_id || '-'}
              </TableCell>
              <TableCell>
                {prospect.user_id || '-'}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {prospect.status === 'new' && (
                  <Button
                    size="sm"
                    onClick={() => handleQualify(prospect)}
                    disabled={loading}
                  >
                    {loading ? 'Qualifying...' : 'Qualify'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedProspect(prospect)
                    setIsEditDialogOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(prospect)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isEditDialogOpen && selectedProspect && (
        <EditProspectDialog
          prospect={selectedProspect}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onUpdate={handleProspectUpdate}
        />
      )}
    </div>
  )
}
