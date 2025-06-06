'use client'

import { TestimonialCard } from './testimonial-card'
import { AnimatedText } from '@/components/ui/animated-text'

const testimonials = [
  {
    quote: "This CRM has transformed how we manage our sales pipeline. The interface is intuitive and the features are exactly what we needed.",
    author: "Sarah Johnson",
    role: "Sales Director",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&auto=format&fit=crop&crop=face"
  },
  {
    quote: "The automation features have saved our team countless hours. It's like having an extra team member handling all the routine tasks.",
    author: "Michael Chen",
    role: "Operations Manager",
    company: "InnovateLabs",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&auto=format&fit=crop&crop=face"
  },
  {
    quote: "Customer support is exceptional. Any questions we had were answered promptly and thoroughly. Highly recommend!",
    author: "Emma Davis",
    role: "Customer Success",
    company: "GrowthWorks",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&auto=format&fit=crop&crop=face"
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <AnimatedText
            text="What Our Customers Say"
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 justify-center"
          />
          <AnimatedText
            text="Don't just take our word for it. Here's what teams love about our platform."
            className="text-gray-400 text-lg max-w-2xl mx-auto justify-center"
            delay={0.2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author}
              {...testimonial}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
