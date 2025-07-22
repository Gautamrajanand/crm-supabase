'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { DealsClient } from '@/components/deals/deals-client'
import { useCurrentStream } from '@/hooks/use-current-stream'
import { useAuth } from '@/app/auth-provider'
import { Database } from '@/types/database'
import { Spinner } from '@/components/ui/spinner'

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const { streamId, loading: streamLoading } = useCurrentStream()
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )

  useEffect(() => {
    if (!streamId || streamLoading) {
      return
    }

    async function fetchDeals() {
      try {
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            customers (
              id,
              name,
              company
            )
          `)
          .eq('stream_id', streamId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setDeals(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchDeals()

    // Clear deals when switching streams
    return () => {
      setDeals([])
      setLoading(true)
    }
  }, [streamId, streamLoading, user, router, supabase])

  if (loading || streamLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return <DealsClient initialDeals={deals} />
}
