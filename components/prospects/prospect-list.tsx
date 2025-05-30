'use client'

import { useState } from 'react'
import { ProspectWithActivities } from '@/types/outreach'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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

type SortableFields = keyof Pick<ProspectWithActivities, 'name' | 'company' | 'status' | 'created_at' | 'priority'>

export function ProspectList({ prospects: initialProspects }: { prospects: ProspectWithActivities[] }) {
  const [prospects, setProspects] = useState(initialProspects)
  const [editingProspect, setEditingProspect] = useState<ProspectWithActivities | null>(null)
  const [sortField, setSortField] = useState<SortableFields>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { streamId: currentStreamId } = useCurrentStream()
  const { openCustomerDrawer } = useCustomerDrawer()

  const handleSort = (field: SortableFields) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedProspects = [...prospects].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    const modifier = sortDirection === 'asc' ? 1 : -1

    if (!aValue && !bValue) return 0
    if (!aValue) return 1 * modifier
    if (!bValue) return -1 * modifier

    if (aValue < bValue) return -1 * modifier
    if (aValue > bValue) return 1 * modifier
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

      toast.success('Prospect deleted successfully')
      
      // Add a small delay then refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error deleting prospect:', error)
      toast.error('Failed to delete prospect')
    }
  }

  const handleUpdate = (updatedProspect: ProspectWithActivities) => {
    // Add a small delay then refresh the page
    setTimeout(() => {
      window.location.reload()
    }, 100)
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

      // Add a small delay then refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 100)

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

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (customerError) {
        console.error('Error creating customer:', customerError)
        toast.error(`Failed to create customer: ${customerError.message}`)
        return
      }

      if (!customer) {
        console.error('No customer data returned')
        toast.error('Failed to create customer: No data returned')
        return
      }

      // Finally create an initial deal
      const dealData = {
        title: `${prospect.company} - Initial Contact`,
        stage: 'lead',
        customer_id: customer.id,
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

      toast.success('Prospect qualified successfully')
      // Navigate to the deals page under dashboard
      router.push('/dashboard/deals')
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
            <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>Priority</TableHead>
            <TableHead>Deal Value</TableHead>
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
                  if (prospect.customer_id) {
                    try {
                      // Fetch the latest customer data including deals
                      const { data: customerData, error } = await supabase
                        .from('customers')
                        .select('*, deals(*)')
                        .eq('id', prospect.customer_id)
                        .single()

                      if (error) throw error

                      if (customerData) {
                        const customer = {
                          ...customerData,
                          // Preserve existing values
                          company: customerData.company || prospect.company,
                          website: customerData.website,
                          industry: customerData.industry,
                          annual_revenue: customerData.annual_revenue,
                          employee_count: customerData.employee_count,
                          last_contacted: customerData.last_contacted,
                          notes: customerData.notes,
                          tags: customerData.tags || [],
                          address: customerData.address,
                          lifetime_value: customerData.lifetime_value,
                          status: customerData.status || 'Active',
                          linkedin: customerData.linkedin,
                          deals: customerData.deals,
                          dealValue: customerData.deals?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0
                        }
                        openCustomerDrawer(customer)
                      }
                    } catch (error) {
                      console.error('Error opening customer drawer:', error)
                      toast.error('Failed to open customer drawer')
                    }
                  }
                }}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">{prospect.name}</div>
                {prospect.notes && (
                  <div className="mt-1 text-sm text-gray-500 line-clamp-1">{prospect.notes}</div>
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium">{prospect.company}</div>
                {prospect.industry && (
                  <div className="text-sm text-gray-500">{prospect.industry}</div>
                )}
                {prospect.company_size && (
                  <div className="text-sm text-gray-500">{prospect.company_size} employees</div>
                )}
              </TableCell>
              <TableCell>{prospect.title}</TableCell>
              <TableCell>
                <div>{prospect.email}</div>
                {prospect.phone && <div className="text-sm text-gray-500">{prospect.phone}</div>}
                {prospect.linkedin_url && (
                  <a 
                    href={prospect.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    LinkedIn
                  </a>
                )}
              </TableCell>
              <TableCell>
                {prospect.source ? (
                  <Badge variant="secondary">{prospect.source}</Badge>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                {prospect.priority ? (
                  <Badge
                    variant="outline"
                    className={prospect.priority === 'high' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                      prospect.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                      'bg-gray-50 text-gray-700 ring-gray-600/20'}
                  >
                    {prospect.priority}
                  </Badge>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
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
                {new Date(prospect.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {prospect.added_by || '-'}
              </TableCell>
              <TableCell>
                {prospect.assigned_to || '-'}
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
                  onClick={() => setEditingProspect(prospect)}
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

      {editingProspect && (
        <EditProspectDialog
          prospect={editingProspect}
          open={true}
          onClose={() => setEditingProspect(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
