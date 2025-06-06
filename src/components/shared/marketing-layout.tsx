'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Header } from '../landing/header'

interface MarketingLayoutProps {
  children: React.ReactNode
  showHeaderCta?: boolean
}

export function MarketingLayout({ children, showHeaderCta = true }: MarketingLayoutProps) {
  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </>
  )
}
