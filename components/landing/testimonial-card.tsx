'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GlowCard } from '@/components/ui/glow-card'
import { Quote } from 'lucide-react'

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  company: string
  image?: string
  delay?: number
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  image,
  delay = 0
}: TestimonialCardProps) {
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
        <Quote className="h-6 w-6" />
      </div>
      <p className="text-gray-300 mb-4 group-hover:text-gray-200 transition-colors duration-300">
        {quote}
      </p>
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-blue-500/20 group-hover:border-blue-500/40 transition-colors duration-300">
          {image ? (
            <AvatarImage src={image} />
          ) : (
            <AvatarFallback>{author[0]}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="font-semibold text-white group-hover:text-blue-200 transition-colors duration-300">
            {author}
          </p>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
            {role} at {company}
          </p>
        </div>
      </div>
    </GlowCard>
  )
}
