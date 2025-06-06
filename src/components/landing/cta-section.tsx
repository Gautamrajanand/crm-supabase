'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { GlowCard } from '@/components/ui/glow-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { AnimatedText } from '@/components/ui/animated-text'

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <GlowCard className="p-12 relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-4 h-4" />
              <span>Limited Time Offer</span>
            </div>

            <AnimatedText
              text="Ready to Transform Your Sales?"
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 justify-center"
            />

            <AnimatedText
              text="Start your 14-day free trial today. No credit card required."
              className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto justify-center"
              delay={0.2}
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <GradientButton 
                  size="lg" 
                  className="text-lg px-8"
                >
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </GradientButton>
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Join thousands of teams already using our platform
            </p>
          </div>
        </GlowCard>
      </div>
    </section>
  )
}
