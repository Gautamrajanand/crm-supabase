import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface GradientButtonProps extends React.ComponentProps<typeof Button> {
  gradientFrom?: string
  gradientTo?: string
  glowColor?: string
}

export function GradientButton({
  children,
  className,
  gradientFrom = 'from-orange-400/80',
  gradientTo = 'to-orange-500/80',
  glowColor = 'orange/70',
  ...props
}: GradientButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      <div
        className={cn(
          'absolute -inset-1 rounded-lg bg-gradient-to-r',
          gradientFrom,
          gradientTo,
          'opacity-70 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200',
        )}
      />
      <Button
        className={cn(
          'relative bg-black text-white',
          'border-0 hover:bg-black/80',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}
