'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function RisingRevenueGraph() {
  // Generate data points for the graph
  const points = Array.from({ length: 12 }, (_, i) => ({
    x: i * (100 / 11), // Spread points evenly across 100% width
    y: 95 - Math.max(5, 80 - (i * 7) - Math.random() * 3) // Rising trend with slight randomness, starts low and goes high
  }))

  // Create the SVG path from points
  const pathData = points.reduce((path, point, i) => {
    const command = i === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '')

  return (
    <div className="w-full h-64 relative">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Animated path */}
        <motion.path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill="url(#graphGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Animated line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Animated dots */}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="1"
            fill="rgb(59, 130, 246)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  )
}
