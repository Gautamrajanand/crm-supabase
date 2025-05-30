'use client'

import { Database } from '@/types/database'
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

interface RecentActivityProps {
  deals: Deal[]
}

export function RecentActivity({ deals }: RecentActivityProps) {
  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your deals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {recentDeals.map((deal, dealIdx) => (
            <div key={deal.id} className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
              <span
                className={cn(
                  'flex h-2 w-2 translate-y-1.5 rounded-full',
                  deal.stage === 'closed_won'
                    ? 'bg-emerald-500'
                    : deal.stage === 'closed_lost'
                    ? 'bg-rose-500'
                    : 'bg-primary'
                )}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{deal.title}</p>
                  <time className="text-sm text-muted-foreground" dateTime={deal.updated_at}>
                    {new Date(deal.updated_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">
                  {deal.customers?.name} · ${deal.value?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
