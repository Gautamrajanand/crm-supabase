'use client'

import { StrictMode } from 'react'

export function StrictModeWrapper({ children }: { children: React.ReactNode }) {
  return <StrictMode>{children}</StrictMode>
}
