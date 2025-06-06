import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

export function FounderQuote() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24 border-4 border-orange-500/20">
                    <AvatarImage src="/founder.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <blockquote className="text-xl md:text-2xl text-gray-300 mb-6 italic">
                    "We built this CRM with one goal in mind: to help businesses not just manage their relationships, but to truly understand and grow them. Every feature we've developed comes from real-world feedback and our commitment to making sales teams more effective."
                  </blockquote>
                  <div>
                    <p className="font-semibold text-white text-lg">John Doe</p>
                    <p className="text-gray-400">Founder & CEO</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
