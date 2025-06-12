'use client'

import React from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from './auth-provider'
import { CustomerDrawerProvider } from '../context/customer-drawer-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <AuthProvider>
        <CustomerDrawerProvider>
          {children}
          <Toaster richColors position="top-right" />
        </CustomerDrawerProvider>
      </AuthProvider>
    </React.StrictMode>
  )
}
