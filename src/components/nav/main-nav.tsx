import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export function MainNav({
  items,
  children,
}: {
  items?: { title: string; href: string }[]
  children?: React.ReactNode
}) {
  return (
    <div className="w-full border-b">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold">
            CRM
          </Link>
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
        </div>
        <Link href="/login" className="text-sm font-medium hover:text-foreground">
          Login
        </Link>
      </nav>
    </div>
  )
}
