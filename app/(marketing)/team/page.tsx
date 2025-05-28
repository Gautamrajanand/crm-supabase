'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { GlowCard } from '@/components/ui/glow-card'
import { Header } from '@/components/landing/header'
import { Github, Linkedin, Twitter } from 'lucide-react'

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    bio: 'Visionary leader with 15+ years of experience in SaaS and CRM solutions.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    bio: 'Tech innovator specializing in AI and machine learning applications.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Product',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    bio: 'Product strategist focused on creating intuitive user experiences.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
  {
    name: 'David Kim',
    role: 'Lead Engineer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    bio: 'Full-stack developer with expertise in scalable architecture.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
]

export default function TeamPage() {
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
              <Badge variant="secondary" className="mb-4">Our Team</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-6">
                Meet the Innovators
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                The talented individuals behind our success, working together to transform CRM solutions.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlowCard className="h-full">
                    <div className="p-6 text-center">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full rounded-full bg-gray-900"
                        />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                      <div className="text-blue-400 mb-3">{member.role}</div>
                      <p className="text-gray-400 mb-4">{member.bio}</p>
                      <div className="flex justify-center gap-4">
                        <a href={member.social.twitter} className="text-gray-400 hover:text-white transition-colors">
                          <Twitter className="w-5 h-5" />
                        </a>
                        <a href={member.social.linkedin} className="text-gray-400 hover:text-white transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                        <a href={member.social.github} className="text-gray-400 hover:text-white transition-colors">
                          <Github className="w-5 h-5" />
                        </a>
                      </div>
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
