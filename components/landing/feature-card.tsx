'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { GlowCard } from '@/components/ui/glow-card'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  delay?: number
}

export function FeatureCard({ title, description, icon: Icon, delay = 0 }: FeatureCardProps) {
  return (
    <GlowCard
      className="p-6"
      delay={delay}
      glowColor="from-blue-500/10"
    >
      <div 
        className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4
                 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors duration-300"
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-200 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>
    </GlowCard>
  )
}
