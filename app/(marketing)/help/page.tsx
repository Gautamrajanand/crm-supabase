'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { GlowCard } from '@/components/ui/glow-card'
import { Header } from '@/components/landing/header'
import { Search, MessageSquare, Book, Video, Mail, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const categories = [
  {
    title: 'Getting Started',
    icon: Book,
    articles: [
      'How to set up your account',
      'Creating your first revenue stream',
      'Adding team members',
    ],
  },
  {
    title: 'Video Tutorials',
    icon: Video,
    articles: [
      'Quick start guide',
      'Advanced features walkthrough',
      'Team collaboration basics',
    ],
  },
  {
    title: 'FAQs',
    icon: MessageSquare,
    articles: [
      'Billing and subscriptions',
      'Security and privacy',
      'Data management',
    ],
  },
]

const contactMethods = [
  {
    title: 'Email Support',
    description: '24/7 email support for all customers',
    icon: Mail,
    action: 'Email Us',
    link: 'mailto:support@crm.com',
  },
  {
    title: 'Phone Support',
    description: 'Available for Enterprise customers',
    icon: Phone,
    action: 'Call Us',
    link: 'tel:+1234567890',
  },
]

export default function HelpPage() {
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
              <Badge variant="secondary" className="mb-4">Help Center</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-6">
                How can we help?
              </h1>
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for help..."
                    className="w-full pl-10 bg-gray-900/50 border-gray-800 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {categories.map((category, i) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlowCard className="h-full">
                    <div className="p-6">
                      <category.icon className="w-10 h-10 text-blue-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
                      <ul className="space-y-3">
                        {category.articles.map((article) => (
                          <li key={article}>
                            <a
                              href="#"
                              className="text-gray-400 hover:text-white transition-colors block"
                            >
                              {article}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>

            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Still need help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {contactMethods.map((method, i) => (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <GlowCard className="h-full">
                      <div className="p-6">
                        <method.icon className="w-10 h-10 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                        <p className="text-gray-400 mb-4">{method.description}</p>
                        <Button
                          variant="secondary"
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                          onClick={() => window.location.href = method.link}
                        >
                          {method.action}
                        </Button>
                      </div>
                    </GlowCard>
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
