'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ClientContentProps {
  children: React.ReactNode
}

export function ClientContent({ children }: ClientContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
