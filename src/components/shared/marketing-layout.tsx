import React from 'react'
import { Header } from '../landing/header'
import { ClientContent } from './marketing-layout-client'

interface MarketingLayoutProps {
  children: React.ReactNode
  showHeaderCta?: boolean
}

export function MarketingLayout({ children, showHeaderCta = true }: MarketingLayoutProps) {
  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-black text-white">
        <ClientContent>{children}</ClientContent>
      </main>
    </>
  )
}
