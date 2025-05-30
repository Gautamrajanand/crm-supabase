'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { DealBoard } from './deal-board'
import { CreateDealButton } from './create-deal-button'

type DealStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

type Deal = Database['public']['Tables']['deals']['Row'] & {
  stage: DealStage
  customers: {
    id: string
    name: string
    company: string | null
    email: string | null
  } | null
  notes: string | null
  expected_close_date: string | null
}

export function DealsContainer({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)

  // Update deals when initialDeals changes
  useEffect(() => {
    setDeals(initialDeals)
  }, [initialDeals])

  const handleDealCreated = (newDeal: Deal) => {
    setDeals(prevDeals => [...prevDeals, newDeal])
  }

  const handleDealUpdated = (updatedDeal: Deal) => {
    setDeals(prevDeals => prevDeals.map(deal => 
      deal.id === updatedDeal.id ? updatedDeal : deal
    ))
  }

  const handleDealDeleted = (deletedDealId: string) => {
    setDeals(prevDeals => prevDeals.filter(deal => deal.id !== deletedDealId))
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Deals</h1>
        <CreateDealButton onDealCreated={handleDealCreated} />
      </div>
      <DealBoard 
        deals={deals} 
        onDragEnd={(result) => {
          if (!result.destination || result.source.droppableId === result.destination.droppableId) {
            return
          }
          const updatedDeal = {
            ...deals.find(d => d.id === result.draggableId)!,
            stage: result.destination.droppableId as DealStage
          }
          handleDealUpdated(updatedDeal)
        }}
      />
    </div>
  )
}
