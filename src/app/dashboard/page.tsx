'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DealsByStage } from '@/components/dashboard/deals-by-stage'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { PerformanceMetrics } from '@/components/dashboard/performance-metrics'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { Database } from '@/types/database'

type DealStage = 'lead' | 'proposal' | 'negotiation' | 'closed_won'

type Deal = {
  id: string
  title: string
  description: string | null
  value: number
  stage: DealStage
  customer_id: string
  stream_id: string
  user_id: string
  notes: string | null
  expected_close_date: string | null
  created_at: string
  updated_at: string
  customers: {
    id: string
    name: string
    company: string | null
    email: string | null
  } | null
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { stream, streamId, loading: streamLoading } = useCurrentStream()

  useEffect(() => {
    if (!streamId || streamLoading) {
      return
    }

    async function fetchDeals() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            customers!inner (id, name, company, email)
          `)
          .eq('stream_id', streamId || '')
          .order('created_at', { ascending: false })

        if (error) throw error
        setDeals(data?.map(deal => ({
        ...deal,
        stage: (deal.stage || 'lead') as DealStage
      })) || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchDeals()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('deals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals',
          filter: `stream_id=eq.${streamId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('deals')
              .select('*, customers!inner (id, name, company, email)')
              .eq('id', payload.new.id)
              .single()
            if (data) setDeals(prev => [{ ...data, stage: (data.stage || 'lead') as DealStage }, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setDeals(prev => prev.filter(d => d.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            const { data } = await supabase
              .from('deals')
              .select('*, customers!inner (id, name, company, email)')
              .eq('id', payload.new.id)
              .single()
            if (data) setDeals(prev => prev.map(d => d.id === data.id ? { ...data, stage: (data.stage || 'lead') as DealStage } : d))
          }
        }
      )
      .subscribe()

    // Clear deals and unsubscribe when switching streams
    return () => {
      setDeals([])
      setLoading(true)
      subscription.unsubscribe()
    }
  }, [streamId, streamLoading, router, supabase])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
      
      <DashboardStats deals={deals} />

      <PerformanceMetrics deals={deals} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealsByStage deals={deals} />
        <RecentActivity deals={deals} />
      </div>
    </div>
  )
}
