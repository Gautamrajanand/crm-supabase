'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import CustomerList from '@/components/customers/customer-list'
import { Database } from '@/types/database'
import { UsersIcon, CurrencyDollarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { Spinner } from '@/components/ui/spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from '@/lib/utils'

type Deal = Omit<Database['public']['Tables']['deals']['Row'], 'stage'> & {
  stage: 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
}

type Customer = Omit<Database['public']['Tables']['customers']['Row'], 'deals'> & {
  deals?: any[]
  dealValue?: number
  dealsCount?: number
}

type Stats = {
  totalCustomers: number
  totalDealValue: number
  closedWonDeals: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalDealValue: 0,
    closedWonDeals: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const { stream, streamId, loading: streamLoading } = useCurrentStream()

  useEffect(() => {
    if (!streamId || streamLoading) {
      return
    }

    async function fetchCustomers() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // First get all deals that are closed won for this stream
        const { data: closedWonDeals } = await supabase
          .from('deals')
          .select('customer_id, value')
          .eq('stage', 'closed_won')
          .eq('stream_id', streamId || '')

        // Get unique customer IDs from closed won deals
        const customerIds = [...new Set(closedWonDeals?.filter(deal => deal.customer_id).map(deal => deal.customer_id as string) || [])]

        // Calculate total deal value per customer
        const dealValuesByCustomer = closedWonDeals?.reduce((acc, deal) => {
          acc[deal.customer_id] = (acc[deal.customer_id] || 0) + (deal.value || 0)
          return acc
        }, {} as Record<string, number>) || {}

        // Calculate total value of all closed won deals
        const totalDealValue = Object.values(dealValuesByCustomer).reduce((sum, value) => sum + value, 0)

        // Then get only the customers with closed won deals
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select(`
            *,
            deals:deals(*)
          `)
          .eq('stream_id', streamId || '')
          .in('id', customerIds)
          .order('created_at', { ascending: false })

        // Enhance customers with deal information
        const customersWithDeals = (customers || []).map(customer => ({
          ...customer,
          dealValue: dealValuesByCustomer[customer.id] || 0,
          dealsCount: customer.deals?.filter((deal: any) => deal.stage === 'closed_won').length || 0
        })) || []

        setCustomers(customersWithDeals)
        setStats({
          totalCustomers: customersWithDeals.length,
          totalDealValue,
          closedWonDeals: closedWonDeals?.length || 0
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchCustomers()

    // Clear data when switching streams
    return () => {
      setCustomers([])
      setStats({
        totalCustomers: 0,
        totalDealValue: 0,
        closedWonDeals: 0
      })
      setLoading(true)
    }
  }, [streamId, streamLoading, router, supabase])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  const statItems = [
    {
      name: 'Total Leads',
      value: stats.totalCustomers,
      icon: UsersIcon,
      change: '+4.75%',
      changeType: 'positive'
    },
    {
      name: 'Total Deal Value',
      value: formatCurrency(stats.totalDealValue),
      icon: CurrencyDollarIcon,
      change: '+54.02%',
      changeType: 'positive'
    },
    {
      name: 'Closed Won Deals',
      value: stats.closedWonDeals,
      icon: TrophyIcon,
      change: '+12.3%',
      changeType: 'positive'
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Closed Won Deals</h1>
        <p className="text-sm text-muted-foreground">
          View and manage customers with closed won deals
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statItems.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              {stat.change && (
                <div
                  className={cn(
                    'flex items-center text-sm font-medium',
                    stat.changeType === 'positive'
                      ? 'text-emerald-600 dark:text-emerald-500'
                      : 'text-rose-600 dark:text-rose-500'
                  )}
                >
                  {stat.changeType === 'positive' ? (
                    <ArrowUpIcon className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Closed Won Deals</CardTitle>
          <CardDescription>
            View and manage customers with successful deals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerList streamId={streamId} />
        </CardContent>
      </Card>
    </div>
  )
}
