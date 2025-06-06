'use client'

import React from 'react'
import { motion } from 'framer-motion'

type Stat = {
  value: string
  label: string
}

interface AnimatedStatsListProps {
  stats: Stat[]
}

export function AnimatedStatsList({ stats }: AnimatedStatsListProps) {
  return (
    <div className="grid grid-cols-1 gap-8 relative">
      {stats.map((stat, i) => (
        <motion.div
          key={`stat-${i}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          whileHover={{ scale: 1.05 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <motion.div
            className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-blue-500/50 transition-colors"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <div>
                <motion.h3
                  className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.15 + 0.2 }}
                >
                  {stat.value}
                </motion.h3>
                <motion.p
                  className="text-gray-400 mt-1 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.15 + 0.3 }}
                >
                  {stat.label}
                </motion.p>
              </div>
              <motion.div
                className="ml-auto w-1 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.1 }}
              />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
