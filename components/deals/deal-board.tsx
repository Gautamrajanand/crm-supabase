'use client'

import { useState } from 'react'
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd'
import { useCustomerDrawer } from '@/context/customer-drawer-context'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { EditDealDialog } from './edit-deal-dialog'
import { StrictModeDroppable } from './strict-mode-droppable'
import { Database } from '@/types/database'
import { Deal } from './deals-client'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { Customer } from '@/types/shared'

type DealStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

interface DealCardProps {
  deal: Deal
  index: number
  onUpdate: (updatedDeal: Deal) => void
  onDelete: (dealId: string) => void
  onCustomerClick: (deal: Deal) => void
}

function DealCard({ deal, index, onUpdate, onDelete, onCustomerClick }: DealCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const supabase = createClientComponentClient()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', deal.id)

      if (error) throw error

      toast.success('Deal deleted successfully')
      onDelete(deal.id)
      
      // Add a small delay then refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error deleting deal:', error)
      toast.error('Failed to delete deal')
    }
  }

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white dark:bg-gray-800 px-3 py-2.5 rounded-md border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="w-[180px] flex-shrink-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">{deal.title}</h3>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(deal.value)}</p>
            </div>

            {deal.customers && (
              <div 
                className="w-[150px] flex-shrink-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
                onClick={() => onCustomerClick(deal)}
              >
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">{deal.customers.name}</p>
                <p className="text-gray-500 dark:text-gray-400 truncate">{deal.customers.company || 'No company'}</p>
              </div>
            )}

            <div className="flex-1">
              {deal.notes && (
                <p className="text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" title={deal.notes}>
                  {deal.notes}
                </p>
              )}
            </div>

            <div className="w-[100px] flex-shrink-0">
              {deal.expected_close_date && (
                <p className="text-gray-500 dark:text-gray-400 truncate text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                  {formatDate(deal.expected_close_date)}
                </p>
              )}
            </div>

            <div className="w-[80px] flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
              {formatDate(deal.created_at)}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditDialogOpen(true)
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {isEditDialogOpen && (
              <EditDealDialog
                deal={deal}
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onUpdate={onUpdate}
              />
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

interface DealBoardProps {
  deals: Deal[]
  onDragEnd: (result: any) => void
  onDealUpdate: (updatedDeal: Deal) => void
  onDealDelete: (dealId: string) => void
}

export function DealBoard({ deals, onDragEnd, onDealUpdate, onDealDelete }: DealBoardProps) {
  const { openCustomerDrawer } = useCustomerDrawer()
  const supabase = createClientComponentClient()

  const handleCustomerClick = async (deal: Deal) => {
    if (!deal.customers) return
    try {
      // Fetch the latest customer data including deals
      const { data: customerData, error } = await supabase
        .from('customers')
        .select('*, deals(*)')
        .eq('id', deal.customers.id)
        .single()

      if (error) throw error

      if (customerData) {
        const customer: Customer = {
          ...customerData,
          // Preserve existing values
          company: customerData.company || deal.customers.company,
          website: customerData.website || deal.customers.website,
          industry: customerData.industry || deal.customers.industry,
          annual_revenue: customerData.annual_revenue || deal.customers.annual_revenue,
          employee_count: customerData.employee_count || deal.customers.employee_count,
          last_contacted: customerData.last_contacted || deal.customers.last_contacted,
          notes: customerData.notes || deal.customers.notes,
          tags: customerData.tags || deal.customers.tags || [],
          address: customerData.address || deal.customers.address,
          lifetime_value: customerData.lifetime_value || deal.customers.lifetime_value,
          status: customerData.status || 'Active',
          linkedin: customerData.linkedin || deal.customers.linkedin,
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

  const dealsByStage = deals.reduce((acc, deal) => {
    const stage = deal.stage
    if (!acc[stage]) {
      acc[stage] = []
    }
    acc[stage].push(deal)
    return acc
  }, {} as Record<DealStage, Deal[]>)

  const stageColors = {
    lead: 'bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400',
    contact: 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
    proposal: 'bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
    negotiation: 'bg-orange-50 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400',
    closed_won: 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-400',
    closed_lost: 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-400',
  }

  const stages = [
    { id: 'lead', name: 'Lead' },
    { id: 'contact', name: 'Contact' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'closed_won', name: 'Closed Won' },
    { id: 'closed_lost', name: 'Closed Lost' },
  ]

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-6">
        {stages.map(stage => (
          <div key={stage.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm ring-1 ring-gray-900/5">
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <h2 className={`inline-flex px-2.5 py-1 rounded-full text-sm font-medium ${stageColors[stage.id as keyof typeof stageColors]}`}>
                    {stage.name}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {dealsByStage[stage.id as DealStage]?.length || 0} deals
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600 bg-gray-50/30 dark:bg-gray-900/30">
                <div className="w-[180px] flex-shrink-0 uppercase tracking-wider">Deal Name / Value</div>
                <div className="w-[150px] flex-shrink-0 uppercase tracking-wider">Customer / Company</div>
                <div className="flex-1 uppercase tracking-wider">Notes</div>
                <div className="w-[100px] flex-shrink-0 uppercase tracking-wider">Close Date</div>
                <div className="w-[80px] flex-shrink-0 text-right uppercase tracking-wider">Created</div>
              </div>
            </div>

            <div className="p-2 bg-gray-50/20 dark:bg-gray-900/20">
              <StrictModeDroppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-1.5 min-h-[50px]"
                  >
                    {dealsByStage[stage.id as DealStage]?.map((deal, index) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        index={index}
                        onUpdate={onDealUpdate}
                        onDelete={onDealDelete}
                        onCustomerClick={handleCustomerClick}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
