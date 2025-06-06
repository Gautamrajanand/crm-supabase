'use client'

import { GlowCard } from '@/components/ui/glow-card'

interface StatCardProps {
  value: string
  label: string
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <GlowCard
      className="p-6 text-center"
      glowColor="from-blue-500/10"
    >
      <div className="text-4xl font-bold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
        {value}
      </div>
      <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {label}
      </div>
    </GlowCard>
  )
}
