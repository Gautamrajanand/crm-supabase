import { Check } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    description: "Perfect for small teams just getting started.",
    features: [
      "Up to 5 team members",
      "Basic contact management",
      "Deal pipeline",
      "Task management",
      "Email integration",
      "Basic analytics"
    ],
    cta: "Get Started",
    href: "/signup"
  },
  {
    name: "Pro",
    id: "pro",
    price: "$29",
    description: "Ideal for growing teams that need more power.",
    features: [
      "Up to 25 team members",
      "Advanced contact management",
      "Custom deal stages",
      "Team collaboration",
      "Advanced analytics",
      "API access",
      "Priority support"
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=pro"
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "Custom",
    description: "For large organizations with specific needs.",
    features: [
      "Unlimited team members",
      "Custom integrations",
      "Dedicated support",
      "Custom analytics",
      "SLA guarantees",
      "On-premise option",
      "Training & onboarding"
    ],
    cta: "Contact Sales",
    href: "/contact"
  }
]

export function Pricing() {
  return (
    <section
      id="pricing"
      className="container mx-auto px-4 space-y-12 bg-slate-50 py-16 dark:bg-transparent md:py-24 lg:py-32"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-6 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Simple, Transparent Pricing
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Choose the perfect plan for your team
        </p>
      </div>
      <div className="mx-auto grid max-w-screen-lg gap-6 py-4 md:grid-cols-3 lg:gap-8">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={cn(
              "relative rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900",
              tier.id === "pro" && "border-2 border-blue-600"
            )}
          >
            {tier.id === "pro" && (
              <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-center text-sm font-medium text-white">
                Popular
              </div>
            )}
            <div className="mb-8">
              <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>
              <p className="mb-6 text-gray-500 dark:text-gray-400">{tier.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.id !== "enterprise" && <span className="text-gray-500">/month</span>}
              </div>
              <Link
                href={tier.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full",
                  tier.id === "pro" ? "bg-gradient-to-r from-blue-600 to-cyan-600" : ""
                )}
              >
                {tier.cta}
              </Link>
            </div>
            <ul className="space-y-4">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="mr-3 h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
