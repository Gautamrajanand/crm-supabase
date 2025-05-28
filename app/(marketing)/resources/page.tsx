'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { GlowCard } from '@/components/ui/glow-card'
import { Header } from '@/components/landing/header'
import { Book, Video, FileText, Newspaper, MessageSquare, Headphones } from 'lucide-react'
import Link from 'next/link'

const resources = [
  {
    title: 'Documentation',
    description: 'Comprehensive guides and API documentation for developers.',
    icon: Book,
    link: '/docs',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides for getting started and advanced features.',
    icon: Video,
    link: '#',
  },
  {
    title: 'Case Studies',
    description: 'Real-world success stories from our customers.',
    icon: FileText,
    link: '#',
  },
  {
    title: 'Blog',
    description: 'Latest updates, tips, and industry insights.',
    icon: Newspaper,
    link: '#',
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users and share experiences.',
    icon: MessageSquare,
    link: '#',
  },
  {
    title: 'Help Center',
    description: 'Get answers to common questions and technical support.',
    icon: Headphones,
    link: '/help',
  },
]

export default function ResourcesPage() {
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
              <Badge variant="secondary" className="mb-4">Resources</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-6">
                Learning Resources
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Everything you need to succeed with our CRM platform.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource, i) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={resource.link}>
                    <GlowCard className="h-full transition-transform hover:-translate-y-1">
                      <div className="p-6">
                        <resource.icon className="w-10 h-10 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">{resource.title}</h3>
                        <p className="text-gray-400">{resource.description}</p>
                      </div>
                    </GlowCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
