'use client'

import React from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const supabase = createClientComponentClient()

  return (
    <React.StrictMode>
      {children}
    </React.StrictMode>
  )
}
