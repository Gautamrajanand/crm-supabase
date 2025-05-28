'use client'

import { motion } from 'framer-motion'

export function BackgroundGraph() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(5)].map((_, index) => {
        const yOffset = index * 20 // Smaller vertical offset
        const points = Array.from({ length: 12 }, (_, i) => ({
          x: i * (100 / 11),
          y: (80 - yOffset) - Math.max(5, 50 - (i * 5)) // Steeper slope
        }))

        const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`

        return (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 0.2, y: 0 }}
            transition={{ duration: 2, delay: index * 0.2 }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <motion.path
                d={pathData}
                stroke={`url(#gradient-${index})`}
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, delay: index * 0.2, ease: "easeOut" }}
              />
              <motion.path
                d={`${pathData} L 100,100 L 0,100 Z`}
                fill={`url(#gradient-${index})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.05 }}
                transition={{ duration: 2, delay: index * 0.2 + 0.5 }}
              />
              <defs>
                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )
      })}
    </div>
  )
}
