'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

interface MarketingLayoutProps {
  children: React.ReactNode
  showHeaderCta?: boolean
}

export function MarketingLayout({ children, showHeaderCta = true }: MarketingLayoutProps) {
  return (
    <>
      <Header showCta={showHeaderCta} />
      <main className="relative min-h-screen bg-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </>
  )
}
