import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="container mx-auto px-4 space-y-8 pb-12 pt-8 md:pb-16 md:pt-12 lg:py-32">
      <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-6 text-center">
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          Modern CRM for Growing Teams
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Streamline your customer relationships, boost productivity, and grow your business with our intuitive CRM solution.
        </p>
        <div className="space-x-4">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}
