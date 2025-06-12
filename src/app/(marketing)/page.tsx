'use client'

import { headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import LandingPage from '@/components/landing/landing-page'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Marketing() {
  const headersList = headers()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return headersList.get('cookie')?.split(';').find(c => c.trim().startsWith(`${name}=`))?.split('=')[1]
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
