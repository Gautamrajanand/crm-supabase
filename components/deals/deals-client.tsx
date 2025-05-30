'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DealBoard } from './deal-board'
import { DealFilters } from './deal-filters'
import { CreateDealButton } from './create-deal-button'
import { DealStats } from './deal-stats'
import { Database } from '@/types/database'
import type { DropResult } from 'react-beautiful-dnd'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { Spinner } from '@/components/ui/spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type DealStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

import { Customer } from '@/types/shared'

export type Deal = Database['public']['Tables']['deals']['Row'] & {
  stage: DealStage
  customers: Customer | null
  notes: string | null
  expected_close_date: string | null
}

interface DealsClientProps {
  initialDeals: Deal[]
}

export function DealsClient({ initialDeals }: DealsClientProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')

  const supabase = createClientComponentClient<Database>()

  const stats = useMemo(() => {
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    const avgValue = deals.length ? totalValue / deals.length : 0
    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length
    const wonDeals = deals.filter(d => d.stage === 'closed_won').length
    const winRate = wonDeals > 0 ? (wonDeals / deals.length) * 100 : 0

    // Calculate monthly growth (mock data for demo)
    const monthlyGrowth = 12.5 // In a real app, you'd calculate this from historical data

    return {
      totalValue,
      avgValue,
      openDeals,
      wonDeals,
      winRate,
      monthlyGrowth
    }
  }, [deals])

  const { streamId } = useCurrentStream()

  const fetchDeals = async () => {
    if (!streamId) {
      setDeals([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('deals')
        .select(`
          *,
          customers (*, deals(*))
        `)
        .eq('stream_id', streamId)
        .order('value', { ascending: sortOrder === 'asc' })

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
      }

      if (minValue) {
        query = query.gte('value', parseFloat(minValue))
      }

      if (maxValue) {
        query = query.lte('value', parseFloat(maxValue))
      }

      const { data, error } = await query

      if (error) throw error
      setDeals((data || []) as Deal[])
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDealCreated = (newDeal: Deal) => {
    setDeals(prev => [...prev, newDeal])
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.droppableId === result.destination.droppableId) {
      return
    }

    const { draggableId, destination } = result
    const newStage = destination.droppableId as DealStage

    try {
      // Optimistic update
      setDeals(prev => prev.map(deal => 
        deal.id === draggableId ? { ...deal, stage: newStage } : deal
      ))

      const { error } = await supabase
        .from('deals')
        .update({ stage: newStage })
        .eq('id', draggableId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating deal stage:', error)
      // Revert optimistic update on error
      await fetchDeals()
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [streamId, searchQuery, sortOrder, minValue, maxValue])

  const handleDealUpdate = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(deal => deal.id === updatedDeal.id ? updatedDeal : deal))
  }

  const handleDealDelete = (dealId: string) => {
    setDeals(prev => prev.filter(deal => deal.id !== dealId))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deals Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your deals through the pipeline
          </p>
        </div>
        <CreateDealButton onDealCreated={handleDealCreated} />
      </div>

      <DealStats {...stats} />

      <Card>
        <CardHeader>
          <CardTitle>Deals</CardTitle>
          <CardDescription>Filter and sort your deals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DealFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            minValue={minValue}
            onMinValueChange={setMinValue}
            maxValue={maxValue}
            onMaxValueChange={setMaxValue}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No deals found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating a new deal
              </p>
            </div>
          ) : (
            <DealBoard 
              deals={deals} 
              onDragEnd={handleDragEnd}
              onDealUpdate={handleDealUpdate}
              onDealDelete={handleDealDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
