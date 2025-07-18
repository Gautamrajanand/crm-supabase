'use client'

import React from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from './auth-provider'
import { CustomerDrawerProvider } from '../context/customer-drawer-context'
import SupabaseProvider from './providers/supabase-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <SupabaseProvider>
        <AuthProvider>
          <CustomerDrawerProvider>
            {children}
            <Toaster richColors position="top-right" />
          </CustomerDrawerProvider>
        </AuthProvider>
      </SupabaseProvider>
    </React.StrictMode>
  )
}
