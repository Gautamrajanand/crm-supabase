import { createServerSupabase } from '@/utils/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DealsClient } from '@/components/deals/deals-client'

export const revalidate = 0

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function DealsPage({ searchParams }: PageProps) {
  const supabase = createServerSupabase()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get stream ID from URL params
  const streamId = searchParams.stream as string
  
  if (!streamId) {
    redirect('/dashboard/settings')
  }

  // Get all deals and customers for the current stream
  try {
    const { data: deals, error } = await supabase
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

    if (error) {
      console.error('Error fetching deals:', error)
      throw new Error('Failed to fetch deals')
    }

    return <DealsClient initialDeals={deals || []} />
  } catch (error) {
    console.error('Error in DealsPage:', error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground">Failed to load deals. Please try refreshing the page.</p>
      </div>
    )
  }

}
