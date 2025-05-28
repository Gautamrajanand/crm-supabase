'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { GlowCard } from '@/components/ui/glow-card'
import { Header } from '@/components/landing/header'
import { Code, Database, Shield, Zap, Settings, Users } from 'lucide-react'

const docs = [
  {
    title: 'Getting Started',
    description: 'Quick start guide and basic concepts.',
    icon: Zap,
    sections: ['Installation', 'Basic Setup', 'First Steps'],
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation and examples.',
    icon: Code,
    sections: ['Authentication', 'Endpoints', 'Response Formats'],
  },
  {
    title: 'Database Schema',
    description: 'Understanding the data structure.',
    icon: Database,
    sections: ['Tables', 'Relationships', 'Migrations'],
  },
  {
    title: 'Security',
    description: 'Security features and best practices.',
    icon: Shield,
    sections: ['Access Control', 'Data Protection', 'Compliance'],
  },
  {
    title: 'Configuration',
    description: 'System settings and customization.',
    icon: Settings,
    sections: ['Environment Setup', 'Custom Fields', 'Workflows'],
  },
  {
    title: 'User Management',
    description: 'Managing users and permissions.',
    icon: Users,
    sections: ['Roles', 'Permissions', 'Teams'],
  },
]

export default function DocsPage() {
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
              <Badge variant="secondary" className="mb-4">Documentation</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-6">
                Developer Resources
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Everything you need to integrate and customize our CRM platform.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {docs.map((doc, i) => (
                <motion.div
                  key={doc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlowCard className="h-full">
                    <div className="p-6">
                      <doc.icon className="w-10 h-10 text-blue-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-3">{doc.title}</h3>
                      <p className="text-gray-400 mb-4">{doc.description}</p>
                      <ul className="space-y-2">
                        {doc.sections.map((section) => (
                          <li key={section} className="text-gray-300 hover:text-white transition-colors">
                            <a href="#" className="block">
                              {section}
                            </a>
                          </li>
                        ))}
                      </ul>
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
