'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { OrbitingCircles } from '@/components/ui/magic/orbiting-circles'

const stats = [
  {
    value: '40%',
    label: 'Faster Deal Closure'
  },
  {
    value: '10x',
    label: 'Team Productivity'
  },
  {
    value: '99.9%',
    label: 'Uptime SLA'
  },
  {
    value: '24/7',
    label: 'Expert Support'
  }
]

export function OrbitalStats() {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <section className="py-24 relative overflow-hidden bg-black">
      <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-30">
        {isClient && (
          <OrbitingCircles size={1200} dotCount={48} dotSize={2} rotationDuration={60} />
        )}
      </div>
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={`stat-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg blur-xl" />
              <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-lg p-6 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-blue-400 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  {stat.value}
                </h3>
                <p className="text-gray-300 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
