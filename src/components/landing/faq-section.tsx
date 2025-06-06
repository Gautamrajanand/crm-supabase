import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: `How long is the free trial?`,
    answer: `We offer a 14-day free trial for all plans. No credit card required. You can upgrade, downgrade, or cancel at any time.`
  },
  {
    question: `Can I switch plans later?`,
    answer: `Yes, you can switch between plans at any time. When you upgrade or downgrade, we'll prorate your charges accordingly.`
  },
  {
    question: `What payment methods do you accept?`,
    answer: `We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. For Enterprise plans, we also support wire transfers and purchase orders.`
  },
  {
    question: `Is my data secure?`,
    answer: `Yes, we take security seriously. We use industry-standard encryption, regular security audits, and maintain strict data protection policies. Your data is hosted on secure servers with regular backups.`
  },
  {
    question: `Can I import my existing contacts?`,
    answer: `Yes, you can easily import contacts from CSV files, Excel spreadsheets, or integrate directly with popular email providers and other CRM systems.`
  },
  {
    question: `Do you offer customer support?`,
    answer: `Yes, we provide email and chat support for all plans. Professional plans include priority support, while Enterprise plans get dedicated account management.`
  }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-gray-800"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="py-6 w-full flex justify-between items-center text-left"
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  return (
    <section className="py-24" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have a different question? Reach out to our support team.
            </p>
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="divide-y divide-gray-800">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
