'use client'

import React from 'react'
import Link from 'next/link'
import { motion, useScroll } from 'framer-motion'
import { useSpring, animated, config } from '@react-spring/web'
import { useInView } from 'react-intersection-observer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GlowCard } from '@/components/ui/glow-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { AnimatedText } from '@/components/ui/animated-text'
import { StatsGrid } from '@/components/ui/magic/stats-grid'
import { Header } from './header'
import { BackgroundGraph } from './background-graph'
import { FeaturesSection } from './features-section'
import { TestimonialsSection } from './testimonials-section'
import { CompanyLogos } from './company-logos'
import { FounderQuote } from './founder-quote'
import { CTASection } from './cta-section'
import { PricingSection } from './pricing-section'
import { FAQSection } from './faq-section'
import { ErrorBoundary } from './error-boundary'
import {
  Users,
  Zap,
  ArrowRight,
  Mail,
  Shield,
  Sparkles,
  LineChart,
  Target,
  Twitter,
  Github,
  Linkedin,
} from 'lucide-react'



const benefits = [
  'Increase deal closure rate by up to 40%',
  'Real-time Analytics & Insights',
  'Automated Lead Tracking',
  'Team Collaboration Tools',
  'Multi-stream Revenue Management',
  'Advanced Security & Compliance',
  'Customizable Workflows',
  'Team Performance Analytics'
]

const AnimatedBadge = animated(Badge)
const AnimatedGlowCard = animated(GlowCard)

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-gradient-slow opacity-30" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 relative inline-flex">Benefits</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
            Why Choose Our CRM?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-20">
          {benefits.map((benefit, i) => (
            <motion.div
              key={`benefit-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-1"
            >
              <Sparkles className="w-8 h-8 text-blue-400 mb-4 group-hover:text-blue-300 transition-colors" />
              <h3 className="font-semibold text-lg text-white mb-2">{benefit}</h3>
              <p className="text-gray-400 text-sm">Streamline your workflow and boost productivity with our advanced CRM features.</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingPageContent() {
  const { scrollYProgress } = useScroll()

  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-black text-white">
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
          <BackgroundGraph />
          <div className="container max-w-4xl mx-auto px-4 py-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600 leading-tight mb-6">
                Streamline Your
                <br />
                Revenue Management
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Boost productivity and accelerate growth with our intelligent CRM solution.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-600/25"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors duration-200"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
          <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-blue-500/5 animate-gradient-slow" />
          </div>
        </section>

        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-blue-500 transform origin-left z-50"
          style={{
            scaleX: scrollYProgress
          }}
        />

        <CompanyLogos />

        <FeaturesSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Stats Section */}
        {/* Stats Section */}
        <section className="py-24 relative overflow-hidden bg-black/40 backdrop-blur-sm border-y border-gray-800">
          <div className="container mx-auto px-4">
            <div className="relative w-full py-12">
              <StatsGrid
                stats={[
                  { value: '40%', label: 'Faster Deal Closure' },
                  { value: '10x', label: 'Team Productivity' },
                  { value: '99.9%', label: 'Uptime SLA' },
                  { value: '24/7', label: 'Expert Support' }
                ]}
              />
              <div className="mt-16 text-center">
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                    Powerful Stats
                  </h2>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    Our CRM delivers measurable results that help your business grow and succeed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection />

        <PricingSection />

        <FAQSection />

        <CTASection />

        {/* Footer */}
        <footer className="bg-black/90 text-gray-400 py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/features" className="hover:text-white transition-colors">Features</Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">About</Link>
                  </li>
                  <li>
                    <Link href="/team" className="hover:text-white transition-colors">Team</Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
                  </li>
                  <li>
                    <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="mailto:support@crm.com"
                      className="hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      support@crm.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; 2025 CRM. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
