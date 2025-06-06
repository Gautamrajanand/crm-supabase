import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

import { HTMLMotionProps } from 'framer-motion'

interface GlowCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  glowColor?: string
  delay?: number
}

export function GlowCard({
  children,
  className,
  glowColor = 'from-orange-400/10',
  delay = 0,
  ...props
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={cn(
        'group relative rounded-xl bg-gradient-to-b from-gray-900/50 to-gray-900/30',
        'border border-gray-800/50 backdrop-blur-xl',
        'hover:border-gray-700/50 transition-all duration-300',
        className
      )}
      {...props}
    >
      {/* Glow Effect */}
      <div
        className={cn(
          'absolute -inset-[1px] rounded-xl bg-gradient-to-b opacity-0',
          `${glowColor} to-transparent`,
          'group-hover:opacity-100 transition-opacity duration-300',
          '-z-10 blur-xl'
        )}
      />
      {children}
    </motion.div>
  )
}
