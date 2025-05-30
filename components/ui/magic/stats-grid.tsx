'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface Stat {
  value: string
  label: string
}

interface StatsGridProps {
  stats: Stat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative p-6 bg-black/50 backdrop-blur-xl rounded-lg border border-gray-800 group-hover:border-blue-500/50 transition-all duration-300">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              {stat.value}
            </div>
            <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
