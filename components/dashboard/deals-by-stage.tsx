'use client'

import * as React from 'react'
import { Database } from '@/types/database'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
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

interface DealsByStageProps {
  deals: Deal[]
}

export function DealsByStage({ deals }: DealsByStageProps) {
  const dealsByStage = React.useMemo(() => {
    const stages = ['lead', 'meeting', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    return stages.map((stage) => ({
      stage: stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      count: deals.filter((deal) => deal.stage === stage).length,
    }))
  }, [deals])

  const chartColors = {
    primary: 'hsl(var(--primary))',
    muted: 'hsl(var(--muted-foreground))',
    background: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    foreground: 'hsl(var(--foreground))',
    gridLine: 'hsl(var(--muted))',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals by Stage</CardTitle>
        <CardDescription>Distribution of deals across sales pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={dealsByStage} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartColors.gridLine}
                horizontal={false}
                opacity={0.2}
              />
              <XAxis 
                type="number" 
                stroke={chartColors.foreground}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: chartColors.border }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                dataKey="stage" 
                type="category" 
                stroke={chartColors.foreground}
                fontSize={12}
                width={100}
                tickLine={false}
                axisLine={{ stroke: chartColors.border }}
                tickFormatter={(value) => value}
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
                cursor={{ fill: 'hsl(var(--muted))' }}
                formatter={(value: number) => [`${value} deals`, 'Count']}
              />
              <Bar 
                dataKey="count" 
                fill={chartColors.primary}
                radius={[0, 4, 4, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
