import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'

const LandingPage = dynamic(
  () => import('@/components/landing/landing-page'),
  { loading: () => <div>Loading...</div> }
)

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
