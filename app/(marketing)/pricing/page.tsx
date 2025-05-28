'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { GlowCard } from '@/components/ui/glow-card'
import { Header } from '@/components/landing/header'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      'Basic lead management',
      'Contact management',
      'Email integration',
      'Basic reporting',
      'Mobile app access',
    ],
  },
  {
    name: 'Professional',
    price: '$79',
    description: 'Ideal for growing businesses',
    popular: true,
    features: [
      'Up to 20 team members',
      'Advanced lead scoring',
      'Custom workflows',
      'API access',
      'Advanced analytics',
      'Priority support',
      'Team collaboration tools',
      'Integration with popular tools',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited team members',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced security features',
      'Custom reporting',
      'Training and onboarding',
      'Phone support',
    ],
  },
]

export default function PricingPage() {
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
              <Badge variant="secondary" className="mb-4">Pricing</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Choose the perfect plan for your team. All plans include a 14-day free trial.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlowCard className={`h-full ${plan.popular ? 'border-blue-500' : ''}`}>
                    <div className="p-6">
                      {plan.popular && (
                        <Badge className="mb-4 bg-blue-500/20 text-blue-400">Most Popular</Badge>
                      )}
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.price !== 'Custom' && <span className="text-gray-400">/month</span>}
                      </div>
                      <p className="text-gray-400 mb-6">{plan.description}</p>
                      <Button 
                        className="w-full mb-8"
                        variant="default"
                      >
                        Get Started
                      </Button>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
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
