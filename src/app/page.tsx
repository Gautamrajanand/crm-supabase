import { createServerSupabase } from '@/utils/supabase-server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createServerSupabase()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  // Show landing page for non-authenticated users
  redirect('/marketing')
}
