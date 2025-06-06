import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid'
import { formatCurrency, cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DealStatsProps {
  totalValue: number
  avgValue: number
  openDeals: number
  wonDeals: number
  winRate: number
  monthlyGrowth: number
}


export function DealStats({
  totalValue,
  avgValue,
  openDeals,
  wonDeals,
  winRate,
  monthlyGrowth
}: DealStatsProps) {
  const stats = [
    {
      name: 'Total Pipeline Value',
      value: formatCurrency(totalValue),
      change: monthlyGrowth,
      changeType: monthlyGrowth >= 0 ? 'positive' : 'negative',
    },
    {
      name: 'Average Deal Size',
      value: formatCurrency(avgValue),
      change: '',
    },
    {
      name: 'Open Deals',
      value: openDeals,
      change: '',
    },
    {
      name: 'Won Deals',
      value: wonDeals,
      change: '',
    },
    {
      name: 'Win Rate',
      value: `${Math.round(winRate)}%`,
      change: '',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
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
                {stat.change}%
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
