'use client'

import { useEffect, useState } from 'react'
import { ProspectWithActivities } from '@/types/outreach'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ProspectList } from '@/components/prospects/prospect-list'
import { CreateProspectButton } from '@/components/prospects/create-prospect-button'
import { Database } from '@/types/database'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { EnvelopeIcon, PhoneIcon, UserPlusIcon } from '@heroicons/react/24/outline'
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

export default function OutreachPage() {
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { streamId, loading: streamLoading } = useCurrentStream()
  const [loading, setLoading] = useState(true)
  const [prospects, setProspects] = useState<ProspectWithActivities[]>([])

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
    }
    loadSession()
  }, [])

  useEffect(() => {
    if (!streamId || streamLoading) {
      return
    }

    async function fetchProspects() {
      try {
        setLoading(true)
        const { data: prospects } = await supabase
          .from('prospects')
          .select(`
            *,
            activities (*)
          `)
          .eq('stream_id', streamId || '')
          .order('created_at', { ascending: false })

        setProspects((prospects || []) as ProspectWithActivities[])
      } catch (error) {
        console.error('Error fetching prospects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProspects()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('prospects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospects',
          filter: `stream_id=eq.${streamId}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setProspects(prev => [payload.new as ProspectWithActivities, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setProspects(prev => prev.filter((p: ProspectWithActivities) => p.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setProspects(prev => prev.map((p: ProspectWithActivities) => p.id === payload.new.id ? payload.new as ProspectWithActivities : p))
          }
        }
      )
      .subscribe()

    return () => {
      setProspects([])
      setLoading(true)
      subscription.unsubscribe()
    }
  }, [streamId, streamLoading])

  if (loading || streamLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  // Calculate outreach metrics
  const totalProspects = prospects.length
  const newProspects = prospects.filter(p => p.status === 'new').length
  const qualifiedProspects = prospects.filter(p => p.status === 'qualified').length

  const stats = [
    {
      name: 'Total Prospects',
      value: totalProspects,
      icon: UserPlusIcon,
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      name: 'New Prospects',
      value: newProspects,
      icon: EnvelopeIcon,
      change: '+7.2%',
      changeType: 'positive'
    },
    {
      name: 'Qualified Prospects',
      value: qualifiedProspects,
      icon: PhoneIcon,
      change: '+15.3%',
      changeType: 'positive'
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Outreach</h1>
          <p className="text-sm text-muted-foreground">
            Manage your prospects and qualify them into leads
          </p>
        </div>
        <CreateProspectButton />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              {typeof stat.change === 'string' ? (
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
              ) : null}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prospects</CardTitle>
          <CardDescription>
            View and manage your prospects pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProspectList prospects={prospects || []} />
        </CardContent>
      </Card>
    </div>
  )
}
