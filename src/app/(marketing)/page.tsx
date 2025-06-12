import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'

const LandingPage = dynamic(
  () => import('@/components/landing/landing-page'),
  {
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-orange-500"></div>
      </div>
    ),
    ssr: true
  }
)

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookies().get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
