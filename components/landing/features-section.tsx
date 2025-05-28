'use client'

import { motion } from 'framer-motion'
import { BentoGrid, BentoGridItem } from '@/components/ui/magic/bento-grid'
import { OrbitingCircles } from '@/components/ui/magic/orbiting-circles'
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Bell,
  Mail,
  Target,
  Zap
} from 'lucide-react'

const features = [
  {
    title: 'Advanced Analytics',
    description: 'Get deep insights into your sales pipeline with powerful analytics and reporting tools.',
    icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
  },
  {
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team using built-in collaboration features and real-time updates.',
    icon: <Users className="w-6 h-6 text-blue-500" />,
  },
  {
    title: 'Smart Communication',
    description: 'Stay in touch with customers through integrated messaging and automated follow-ups.',
    icon: <MessageSquare className="w-6 h-6 text-blue-500" />,
  },
  {
    title: 'Schedule Management',
    description: 'Efficiently manage meetings and follow-ups with our integrated calendar system.',
    icon: <Calendar className="w-6 h-6 text-blue-500" />,
  },
  {
    title: 'Customizable Workflow',
    description: 'Tailor the CRM to your needs with customizable fields, stages, and automation rules.',
    icon: <Settings className="w-6 h-6 text-blue-500" />,
  },
  {
    title: 'Smart Notifications',
    description: 'Never miss an opportunity with intelligent notifications and reminders.',
    icon: <Bell className="w-6 h-6 text-blue-500" />,
  },
  {
    title: 'Email Integration',
    description: 'Seamlessly integrate with your email to track all customer communications.',
    icon: <Mail className="w-6 h-6 text-blue-500" />,
  },
  {
    title: 'Goal Tracking',
    description: 'Set and monitor sales targets with visual progress tracking and forecasting.',
    icon: <Target className="w-6 h-6 text-blue-500" />,
  },
  {
    title: 'Automation Tools',
    description: 'Streamline your workflow with powerful automation tools and triggers.',
    icon: <Zap className="w-6 h-6 text-blue-500" />,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 relative overflow-hidden bg-gradient-to-b from-black to-gray-900/50">
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <OrbitingCircles size={1000} dotCount={48} dotSize={3} rotationDuration={60} />
      </div>
      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 relative z-20">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to manage your customer relationships effectively and grow your business.
            </p>
          </motion.div>
        </div>

        <BentoGrid className="max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <BentoGridItem
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 0.1}
              className={index === 3 || index === 5 ? 'md:col-span-2 md:row-span-1' : ''}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}
