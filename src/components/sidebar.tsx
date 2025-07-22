'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, DollarSign, CalendarRange, Settings, Bell, CheckCircle, LogOut, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import RevenueSwitcher from './revenue-switcher'
import { EditLabelDialog } from './edit-label-dialog'

const defaultRoutes = [
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

type CustomLabels = { [key: string]: string }

export default function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const [customLabels, setCustomLabels] = useState<CustomLabels>({})
  const [editingRoute, setEditingRoute] = useState<{ href: string, defaultLabel: string } | null>(null)
  const [routes, setRoutes] = useState(defaultRoutes)
  const [loading, setLoading] = useState(true)

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadCustomLabels()
  }, [])

  // Set up realtime subscription when currentStreamId changes
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      // Get current stream ID from cookie
      const currentStreamId = document.cookie
        .split('; ')
        .find(row => row.startsWith('currentStreamId='))
        ?.split('=')[1]

      if (!currentStreamId) return

      // Clean up existing subscription if any
      if (channel) {
        await channel.unsubscribe()
      }

      const channelId = `stream_preferences_${currentStreamId}`
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stream_preferences',
            filter: `stream_id=eq.${currentStreamId}`,
          },
          () => {
            loadCustomLabels()
          }
        )

      try {
        await channel.subscribe()
      } catch (error) {
        console.error('Error subscribing to channel:', error)
      }
    }

    setupSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [])

  const loadCustomLabels = async () => {
    try {
      // Get current stream ID from cookie
      const currentStreamId = document.cookie
        .split('; ')
        .find(row => row.startsWith('currentStreamId='))
        ?.split('=')[1]

      if (!currentStreamId) {
        setLoading(false)
        return
      }

      // Load stream preferences
      const { data: streamPrefs, error: streamError } = await supabase
        .rpc('get_stream_preferences', { p_stream_id: currentStreamId })

      if (streamError) {
        console.error('Error loading stream preferences:', streamError)
        toast.error('Failed to load custom labels')
        setLoading(false)
        return
      }

      // Use stream preferences or empty object as fallback
      const labels = streamPrefs || {}
      setCustomLabels(labels)
      
      // Update routes with custom labels
      setRoutes(defaultRoutes.map(route => ({
        ...route,
        label: labels[route.href] || route.label
      })))
    } catch (error) {
      console.error('Error loading custom labels:', error)
      toast.error('Failed to load custom labels')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLabel = async (newLabel: string) => {
    if (!editingRoute) return

    try {
      // Get current stream ID from cookie
      const currentStreamId = document.cookie
        .split('; ')
        .find(row => row.startsWith('currentStreamId='))
        ?.split('=')[1]

      if (!currentStreamId) {
        throw new Error('No stream selected')
      }

      const updatedLabels = {
        ...customLabels,
        [editingRoute.href]: newLabel
      }

      // If the new label is the same as default, remove it from custom labels
      if (newLabel === editingRoute.defaultLabel) {
        delete updatedLabels[editingRoute.href]
      }

      const { data, error } = await supabase
        .rpc('update_stream_preferences', {
          p_stream_id: currentStreamId,
          p_sidebar_labels: updatedLabels
        })

      if (error) throw error

      // data is now the updated sidebar_labels JSONB
      const savedLabels = data || {}

      setCustomLabels(savedLabels)
      setRoutes(defaultRoutes.map(route => ({
        ...route,
        label: savedLabels[route.href] || route.label
      })))
    } catch (error) {
      console.error('Error updating label:', error)
      throw error
    }
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r">
      <div className="px-4 py-2 flex-1">
        <Link 
          href="/dashboard" 
          className={`flex items-center mb-6 hover:opacity-75 transition-opacity ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="relative h-5 w-5 mr-3">
            <div className="h-5 w-5 text-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          {!collapsed && (
            <h1 className="text-lg font-kimberly tracking-wide">
              Hub<span className="text-chart-3">crm</span>
            </h1>
          )}
        </Link>
        <div className={`mb-6 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && <RevenueSwitcher />}
        </div>
        <nav className="space-y-1">
          {routes.map((route) => (
            <div key={route.href} className="group relative">
              <Link
                href={route.href}
                className={cn(
                  'text-sm group flex px-3 py-2 w-full items-center font-medium cursor-pointer rounded-md transition-colors',
                  'hover:bg-accent/50 active:bg-accent',
                  pathname === route.href 
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
                    pathname === route.href ? route.color : 'text-muted-foreground group-hover:text-foreground'
                  )} 
                />
                {!collapsed && (
                  <span className="flex-1">{route.label}</span>
                )}
              </Link>
              {!collapsed && (
                <button
                  onClick={() => setEditingRoute({
                    href: route.href,
                    defaultLabel: defaultRoutes.find(r => r.href === route.href)?.label || route.label
                  })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-accent/50"
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="px-4 py-2 border-t border-border space-y-2">

        {/* Collapse Button (desktop only) */}
        <button
          onClick={() => onCollapse?.(!collapsed)}
          className={cn(
            'text-sm group hidden lg:flex px-3 py-2 w-full items-center font-medium cursor-pointer rounded-md transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2.5 text-muted-foreground group-hover:text-foreground" />
              Collapse
            </>
          )}
        </button>

        {/* Logout Button */}
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
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2.5", "text-muted-foreground group-hover:text-foreground")} />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {editingRoute && (
        <EditLabelDialog
          open={true}
          onClose={() => setEditingRoute(null)}
          onUpdate={handleUpdateLabel}
          defaultLabel={editingRoute.defaultLabel}
          currentLabel={routes.find(r => r.href === editingRoute.href)?.label || editingRoute.defaultLabel}
        />
      )}
    </div>
  )
}
