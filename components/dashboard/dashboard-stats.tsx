'use client'

import { Database } from '@/types/database'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Deal = Database['public']['Tables']['deals']['Row'] & {
  customers: {
    id: string
    name: string
    company: string | null
  } | null
  stage: 'lead' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
}

interface DashboardStatsProps {
  deals: Deal[]
}

export function DashboardStats({ deals }: DashboardStatsProps) {
  // Get current and last month's date ranges
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentMonthStart = new Date(currentYear, currentMonth, 1)
  const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0)
  
  // Calculate metrics
  const metrics = {
    // Monthly Revenue (from closed won deals this month)
    thisMonthRevenue: deals
      .filter(deal => {
        const closeDate = new Date(deal.updated_at) // Using updated_at as close date
        return deal.stage === 'closed_won' &&
               closeDate >= currentMonthStart &&
               closeDate <= currentMonthEnd
      })
      .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0),

    // Pipeline Value (sum of all active deals)
    pipelineValue: deals
      .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0),

    // Active Deals Count
    activeDeals: deals.filter(deal => 
      !['closed_won', 'closed_lost'].includes(deal.stage)
    ).length,

    // Win Rate (last 30 days)
    recentWinRate: (() => {
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
      const recentDeals = deals.filter(deal => {
        const closeDate = new Date(deal.updated_at)
        return closeDate >= thirtyDaysAgo && ['closed_won', 'closed_lost'].includes(deal.stage)
      })
      const wonDeals = recentDeals.filter(deal => deal.stage === 'closed_won').length
      return recentDeals.length > 0 ? (wonDeals / recentDeals.length) * 100 : 0
    })(),

    // Average Deal Size (closed won deals)
    avgDealSize: (() => {
      const wonDeals = deals.filter(deal => deal.stage === 'closed_won')
      const totalValue = wonDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0)
      return wonDeals.length > 0 ? totalValue / wonDeals.length : 0
    })(),
  }

  // Calculate month-over-month changes
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1)
  const lastMonthEnd = new Date(currentYear, currentMonth, 0)
  
  const lastMonthRevenue = deals
    .filter(deal => {
      const closeDate = new Date(deal.updated_at)
      return deal.stage === 'closed_won' &&
             closeDate >= lastMonthStart &&
             closeDate <= lastMonthEnd
    })
    .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0)

  const revenueChange = lastMonthRevenue ? 
    ((metrics.thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  const stats = [
    {
      name: 'Monthly Revenue',
      value: `$${metrics.thisMonthRevenue.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`,
      change: revenueChange,
      changeType: revenueChange >= 0 ? 'positive' : 'negative',
    },
    {
      name: 'Pipeline Value',
      value: `$${metrics.pipelineValue.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`,
      change: 0, // Pipeline value change could be calculated if needed
      changeType: 'neutral',
    },
    {
      name: 'Win Rate (30d)',
      value: `${metrics.recentWinRate.toFixed(1)}%`,
      change: 0,
      changeType: 'neutral',
    },
    {
      name: 'Avg Deal Size',
      value: `$${metrics.avgDealSize.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`,
      change: 0,
      changeType: 'neutral',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.name}
            </CardTitle>
            {typeof stat.change === 'number' ? (
              <div
                className={cn(
                  'flex items-center text-sm font-medium',
                  stat.changeType === 'positive'
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : stat.changeType === 'negative'
                    ? 'text-rose-600 dark:text-rose-500'
                    : 'text-muted-foreground'
                )}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                ) : stat.changeType === 'negative' ? (
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                ) : null}
                {stat.change > 0 ? '+' : ''}
                {stat.change.toFixed(0)}%
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
