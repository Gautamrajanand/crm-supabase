'use client'

import { Check } from 'lucide-react'
import { GlowCard } from '@/components/ui/glow-card'

interface BenefitItemProps {
  text: string
  delay?: number
}

export function BenefitItem({ text, delay = 0 }: BenefitItemProps) {
  return (
    <GlowCard
      className="p-3 flex items-center gap-3"
      delay={delay}
      glowColor="from-blue-500/10"
    >
      <div 
        className="h-6 w-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0
                 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors duration-300"
      >
        <Check className="h-4 w-4" />
      </div>
      <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
        {text}
      </span>
    </GlowCard>
  )
}
