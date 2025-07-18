'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Profile', href: '/dashboard/settings' },
  { name: 'Team', href: '/dashboard/settings/team' }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
          {/* Side navigation */}
          <aside className="lg:col-span-3">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
