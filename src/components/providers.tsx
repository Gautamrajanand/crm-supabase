'use client'

import React from 'react'
import { createBrowserClient as createClient } from '@supabase/ssr'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return (
    <React.StrictMode>
      {children}
    </React.StrictMode>
  )
}
