'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { GlowCard } from '@/components/ui/glow-card'
import { Header } from '@/components/landing/header'
import { 
  Users, Shield, Sparkles, LineChart, 
  Target, Zap, Settings, RefreshCw 
} from 'lucide-react'

const features = [
  {
    title: 'Smart Lead Management',
    description: 'Intelligently track and manage leads through your sales pipeline with automated scoring and prioritization.',
    icon: Users,
  },
  {
    title: 'Revenue Stream Analytics',
    description: 'Get detailed insights into your revenue streams with real-time analytics and customizable dashboards.',
    icon: LineChart,
  },
  {
    title: 'Advanced Security',
    description: 'Enterprise-grade security with role-based access control and data encryption at rest and in transit.',
    icon: Shield,
  },
  {
    title: 'Performance Tracking',
    description: 'Monitor team and individual performance with detailed metrics and actionable insights.',
    icon: Target,
  },
  {
    title: 'Automation Tools',
    description: 'Streamline your workflow with powerful automation tools for repetitive tasks and follow-ups.',
    icon: Zap,
  },
  {
    title: 'Custom Workflows',
    description: 'Create and customize workflows that match your unique business processes and requirements.',
    icon: Settings,
  },
  {
    title: 'Real-time Updates',
    description: 'Stay up-to-date with real-time notifications and updates across your entire CRM system.',
    icon: RefreshCw,
  },
  {
    title: 'AI-Powered Insights',
    description: 'Leverage artificial intelligence to uncover valuable insights and predict sales outcomes.',
    icon: Sparkles,
  },
]

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white">
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-gradient-slow opacity-30" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge variant="secondary" className="mb-4">Features</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-6">
                Powerful Features for Modern Sales Teams
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Discover the tools and capabilities that make our CRM the perfect choice for growing businesses.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlowCard className="h-full">
                    <div className="p-6">
                      <feature.icon className="w-10 h-10 text-blue-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
