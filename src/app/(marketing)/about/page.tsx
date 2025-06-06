'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { GlowCard } from '@/components/ui/glow-card'
import { Header } from '@/components/landing/header'
import { Target, Users, Sparkles, LineChart } from 'lucide-react'

const stats = [
  {
    label: 'Active Users',
    value: '10,000+',
    icon: Users,
  },
  {
    label: 'Revenue Generated',
    value: '$100M+',
    icon: LineChart,
  },
  {
    label: 'Success Rate',
    value: '95%',
    icon: Target,
  },
  {
    label: 'Features',
    value: '50+',
    icon: Sparkles,
  },
]

const timeline = [
  {
    year: '2023',
    title: 'Company Founded',
    description: 'Started with a vision to revolutionize CRM systems for modern businesses.',
  },
  {
    year: '2024',
    title: 'Rapid Growth',
    description: 'Expanded our team and feature set, serving thousands of customers globally.',
  },
  {
    year: '2025',
    title: 'Innovation Leader',
    description: 'Pioneering AI-driven CRM solutions and setting new industry standards.',
  },
]

export default function AboutPage() {
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
              <Badge variant="secondary" className="mb-4">About Us</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-6">
                Our Story
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                We're on a mission to transform how businesses manage their customer relationships.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlowCard className="h-full">
                    <div className="p-6 text-center">
                      <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                      <div className="text-3xl font-bold mb-2">{stat.value}</div>
                      <div className="text-gray-400">{stat.label}</div>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-12">
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-8"
                  >
                    <div className="flex-shrink-0 w-24">
                      <div className="text-2xl font-bold text-blue-400">{item.year}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
