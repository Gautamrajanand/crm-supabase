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
    // Check if stream exists
    const { data: stream, error: streamError } = await supabase
      .from('revenue_streams')
      .select('*')
      .eq('id', streamId)
      .single()

    if (streamError) {
      console.error('Error checking stream:', streamError)
      throw new Error('Failed to check stream')
    }

    if (!stream) {
      console.error('Stream not found:', streamId)
      return (
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Stream Not Found</h1>
          <p className="text-muted-foreground">The requested stream does not exist.</p>
        </div>
      )
    }

    console.log('Stream found:', stream)

    // Check stream membership
    const { data: membership, error: membershipError } = await supabase
      .from('revenue_stream_members')
      .select('*')
      .eq('stream_id', streamId)
      .eq('user_id', session.user.id)
      .single()

    if (membershipError) {
      console.error('Error checking stream membership:', membershipError)
      throw new Error('Failed to check stream membership')
    }

    if (!membership) {
      console.error('User is not a member of this stream')
      return (
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have access to this stream.</p>
        </div>
      )
    }

    console.log('Stream membership:', membership)

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
