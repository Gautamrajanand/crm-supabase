import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DealsClient } from '@/components/deals/deals-client'

export const revalidate = 0

export default async function DealsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookies().get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const currentStreamId = cookies().get('currentStreamId')?.value
  
  if (!currentStreamId) {
    redirect('/dashboard/settings')
  }

  // Get all deals and customers for the current stream
  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      customers (
        id,
        name,
        company
      )
    `)
    .eq('stream_id', currentStreamId || '')
    .order('created_at', { ascending: false })

  return <DealsClient initialDeals={deals || []} />
}
