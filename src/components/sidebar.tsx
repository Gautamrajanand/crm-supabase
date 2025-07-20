'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import RevenueSwitcher from './revenue-switcher'
import { LogOut, LayoutDashboard, Users, DollarSign, CalendarRange, Settings, Bell, CheckCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

const routes = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-orange-500',
  },
  {
    label: 'Prospects',
    icon: Bell,
    href: '/dashboard/outreach',
    color: 'text-violet-500',
  },
  {
    label: 'Leads',
    icon: DollarSign,
    href: '/dashboard/deals',
    color: 'text-green-500',
  },
  {
    label: 'Customers',
    icon: Users,
    href: '/dashboard/customers',
    color: 'text-blue-500',
  },
  {
    label: 'Tasks',
    icon: CheckCircle,
    href: '/dashboard/tasks',
    color: 'text-indigo-500',
  },
  {
    label: 'Calendar',
    icon: CalendarRange,
    href: '/dashboard/calendar',
    color: 'text-purple-500',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
    color: 'text-gray-500',
  },
]

import React from 'react';

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface SidebarProps {
  collapsed?: boolean
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r">
      <div className="px-4 py-2 flex-1">
        <button 
          onClick={async () => {
            try {
              // Get current stream ID from URL
              const urlParams = new URLSearchParams(window.location.search)
              const streamId = urlParams.get('stream')
              const url = streamId ? `/dashboard?stream=${streamId}` : '/dashboard'
              await router.push(url)
            } catch (error) {
              console.error('Navigation error:', error)
              // Use window.location as fallback
              const urlParams = new URLSearchParams(window.location.search)
              const streamId = urlParams.get('stream')
              const url = streamId ? `/dashboard?stream=${streamId}` : '/dashboard'
              window.location.href = url
            }
          }}
          className={`flex items-center mb-6 hover:opacity-75 transition-opacity ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="relative h-5 w-5 mr-3">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-cover" 
            />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-bold">
              Hub<span className="text-chart-3">crm</span>
            </h1>
          )}
        </button>
        <div className={`mb-6 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && <RevenueSwitcher />}
        </div>
        <nav className="space-y-2">
          {routes.map((route) => {
            // Get the current stream ID from URL
            const urlParams = new URLSearchParams(window.location.search)
            const streamId = urlParams.get('stream')
            
            return (
              <button
                key={route.href}
                onClick={async (e) => {
                  e.preventDefault()
                  try {
                    // Construct the URL with stream ID if present
                    const url = streamId ? `${route.href}?stream=${streamId}` : route.href
                    await router.push(url)
                  } catch (error) {
                    console.error('Navigation error:', error)
                    // Use window.location as fallback
                    const url = streamId ? `${route.href}?stream=${streamId}` : route.href
                    window.location.href = url
                  }
                }}
                className={cn(
                  'text-sm group flex px-3 py-2 w-full items-center font-medium cursor-pointer rounded-md transition-colors',
                  'hover:bg-accent/50 active:bg-accent',
                  pathname.startsWith(route.href) 
                    ? 'text-chart-1 bg-accent/50' 
                    : 'text-muted-foreground hover:text-foreground',
                  collapsed ? 'justify-center' : ''
                )}
                title={collapsed ? route.label : undefined}
              >
                <route.icon 
                  className={cn(
                    'h-4 w-4',
                    !collapsed && 'mr-2.5',
                    pathname.startsWith(route.href) ? route.color : 'text-muted-foreground group-hover:text-foreground'
                  )} 
                />
                {!collapsed && route.label}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="px-4 py-2">
        <button
          onClick={async () => {
            try {
              await supabase.auth.signOut()
              router.push('/login')
              toast.success('Logged out successfully')
            } catch (error) {
              console.error('Error logging out:', error)
              toast.error('Failed to log out')
            }
          }}
          className={cn(
            'text-sm group flex px-3 py-2 w-full items-center font-medium cursor-pointer rounded-md transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut 
            className={cn(
              'h-4 w-4',
              !collapsed && 'mr-2.5',
              'text-muted-foreground group-hover:text-foreground'
            )} 
          />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
