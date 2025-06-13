'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { MarketingLayout } from '../shared/marketing-layout'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      }
    }

    checkUser()
  }, [])
  return (
    <MarketingLayout>
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
            Streamline Your Sales Pipeline
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            A modern CRM solution designed for growth-focused businesses
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/auth/sign-up"
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/auth/sign-in"
              className="px-8 py-3 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500/10 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
