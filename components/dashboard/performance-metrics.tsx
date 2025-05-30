'use client'

import * as React from 'react'
import { useMemo } from 'react'
import { Database } from '@/types/database'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Deal = Database['public']['Tables']['deals']['Row'] & {
  stage: 'lead' | 'proposal' | 'negotiation' | 'closed_won'
}

interface PerformanceMetricsProps {
  deals: Deal[]
}

type Stage = 'lead' | 'proposal' | 'negotiation' | 'closed_won'

interface FunnelItem {
  stage: string
  count: number
}

interface RevenueItem {
  month: string
  revenue: number
}

interface Metrics {
  monthlyRevenue: RevenueItem[]
  funnel: FunnelItem[]
  winRateBySize: Array<{
    size: 'small' | 'medium' | 'large'
    total: number
    won: number
    winRate: number
  }>
}

export function PerformanceMetrics({ deals }: PerformanceMetricsProps) {
  const metrics = React.useMemo<Metrics>(() => {
    // Calculate monthly revenue
    const now = new Date()
    const monthlyRevenue = new Array(6).fill(0).map((_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - index)
      const monthDeals = deals.filter(deal => {
        const dealDate = new Date(deal.created_at)
        return dealDate.getMonth() === month.getMonth() &&
          dealDate.getFullYear() === month.getFullYear() &&
          deal.stage === 'closed_won'
      })
      return {
        month: month.toLocaleString('default', { month: 'short' }),
        revenue: monthDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0)
      }
    }).reverse() as RevenueItem[]

    // Calculate funnel metrics
    const stages = ['lead', 'proposal', 'negotiation', 'closed_won'] as const
    const funnel = stages.map(stage => ({
      stage: stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      count: deals.filter(deal => deal.stage === stage).length
    })) as FunnelItem[]

    // Calculate win rate by deal size
    const dealSizeCategories = [
      { size: 'small' as const, total: 0, won: 0 },
      { size: 'medium' as const, total: 0, won: 0 },
      { size: 'large' as const, total: 0, won: 0 },
    ]

    deals.forEach(deal => {
      const value = Number(deal.value) || 0
      const size = value < 1000 ? 'small' : value < 10000 ? 'medium' : 'large'
      const category = dealSizeCategories.find(c => c.size === size)!
      category.total++
      if (deal.stage === 'closed_won') {
        category.won++
      }
    })

    const winRateBySize = dealSizeCategories.map(category => ({
      size: category.size,
      total: category.total,
      won: category.won,
      winRate: category.total > 0 ? (category.won / category.total) * 100 : 0
    }))

    return {
      monthlyRevenue,
      funnel,
      winRateBySize
    }
  }, [deals])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  const chartColors = React.useMemo(() => ({
    primary: 'hsl(var(--primary))',
    muted: 'hsl(var(--muted-foreground))',
    background: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    foreground: 'hsl(var(--foreground))',
    gridLine: 'hsl(var(--muted))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    destructive: 'hsl(var(--destructive))',
    accent: 'hsl(var(--accent))',
  }), [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Monthly revenue over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartColors.gridLine}
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis 
                  dataKey="month" 
                  stroke={chartColors.foreground}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: chartColors.border }}
                />
                <YAxis
                  stroke={chartColors.foreground}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: chartColors.border }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  fillOpacity={0.2}
                  fill="url(#colorRevenue)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.border}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: chartColors.foreground,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  cursor={{ stroke: chartColors.muted }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Deal Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Funnel</CardTitle>
          <CardDescription>Conversion through sales stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={metrics.funnel}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={chartColors.gridLine}
                  opacity={0.2}
                />
                <XAxis
                  type="number"
                  stroke={chartColors.foreground}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: chartColors.border }}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  stroke={chartColors.foreground}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: chartColors.border }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.border}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: chartColors.foreground,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} deals`, 'Count']}
                  cursor={{ fill: chartColors.muted, opacity: 0.1 }}
                />
                <Bar
                  dataKey="count"
                  fill={chartColors.primary}
                  radius={[4, 4, 4, 4]}
                  barSize={20}
                >
                  <LabelList
                    dataKey="count"
                    position="right"
                    fill={chartColors.muted}
                    stroke="none"
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Win Rate by Deal Size */}
      <Card>
        <CardHeader>
          <CardTitle>Win Rate by Deal Size</CardTitle>
          <CardDescription>
            Small: &lt;$1,000 • Medium: $1,000-$10,000 • Large: &gt;$10,000
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.winRateBySize}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  stroke={chartColors.gridLine}
                  opacity={0.2}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  stroke={chartColors.foreground}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: chartColors.border }}
                />
                <YAxis
                  type="category"
                  dataKey="size"
                  stroke={chartColors.foreground}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: chartColors.border }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.border}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: chartColors.foreground
                  }}
                  cursor={{ fill: chartColors.muted, opacity: 0.1 }}
                />
                <Bar
                  dataKey="winRate"
                  fill={chartColors.primary}
                  radius={[4, 4, 4, 4]}
                  barSize={20}
                >
                  <LabelList
                    dataKey="winRate"
                    position="right"
                    fill={chartColors.muted}
                    stroke="none"
                    fontSize={11}
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Performance metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Monthly Growth */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Monthly Growth</h4>
            <p className="text-2xl font-bold">
              {(() => {
                const lastTwo = metrics.monthlyRevenue.slice(-2)
                if (lastTwo.length < 2) return 'N/A'
                const growth = ((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) * 100
                return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
              })()}
            </p>
          </div>

          {/* Average Deal Size */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Average Deal Size</h4>
            <p className="text-2xl font-bold">
              {(() => {
                const wonDeals = deals.filter(d => d.stage === 'closed_won')
                if (!wonDeals.length) return '$0'
                const avg = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0) / wonDeals.length
                return `$${avg.toLocaleString()}`
              })()}
            </p>
          </div>

          {/* Conversion Rate */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Lead to Win Rate</h4>
            <p className="text-2xl font-bold">
              {(() => {
                const totalDeals = deals.length
                const wonDeals = deals.filter(d => d.stage === 'closed_won').length
                return totalDeals ? `${((wonDeals / totalDeals) * 100).toFixed(1)}%` : '0%'
              })()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
