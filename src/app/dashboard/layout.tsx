'use client'

import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/sidebar'
import { Menu } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '../auth-provider'
import { useCustomerDrawer } from '@/context/customer-drawer-context'
import CustomerDrawer from '@/components/customers/customer-drawer'

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  email_notifications: boolean
  dark_mode: boolean
  timezone: string
  created_at: string
  updated_at: string
}

export default function DashboardLayout({
  children,
  params,
  searchParams,
}: {
  children: React.ReactNode
  params: { [key: string]: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const desktopSidebarRef = React.useRef<HTMLDivElement>(null);
  const mobileSidebarRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside sidebar (mobile only)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle click outside on mobile
      if (window.innerWidth < 1024) {
        const target = event.target as Node;
        const clickedOutsideMobile = mobileSidebarRef.current && !mobileSidebarRef.current.contains(target);
        
        if (clickedOutsideMobile && mobileOpen) {
          setMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen]);

  // Handle sidebar collapse on mobile
  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    // On mobile, close the sidebar when collapsed
    if (window.innerWidth < 1024 && collapsed) {
      setMobileOpen(false);
    }
  };
  // Persist sidebar state in localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    if (stored) setSidebarCollapsed(stored === 'true');
  }, []);
  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed ? 'true' : 'false');
  }, [sidebarCollapsed]);
  const router = useRouter()
  const { user, isLoading, supabase } = useAuth()
  const { isOpen, customer, closeDrawer } = useCustomerDrawer()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sharedUserName, setSharedUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let mounted = true;
    
    async function loadSession() {
      if (!user) return
      
      setLoading(true)
      try {

        // Check for stream selection
        const searchParams = new URLSearchParams(window.location.search)
        const urlStreamId = searchParams.get('stream')
        const storedStreamId = localStorage.getItem('currentStreamId')
        
        // If no stream in URL but we have one stored, redirect to include it
        if (!urlStreamId && storedStreamId) {
          const url = new URL(window.location.href)
          url.searchParams.set('stream', storedStreamId)
          router.replace(url.pathname + url.search)
          return
        }
        
        // Check if this is a shared access session
        if (urlStreamId && user.email === 'anonymous@example.com') {
          // Get the user name from user_sessions
          const { data: userSession } = await supabase
            .from('user_sessions')
            .select('user_name')
            .eq('stream_id', urlStreamId)
            .eq('user_email', 'anonymous@example.com')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
            
          if (userSession) {
            setSharedUserName(userSession.user_name)
          }
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile && mounted) {
          setProfile(profile)
          // Apply dark mode
          if (profile.dark_mode) {
            document.documentElement.classList.add('dark')
            document.documentElement.style.colorScheme = 'dark'
          } else {
            document.documentElement.classList.remove('dark')
            document.documentElement.style.colorScheme = 'light'
          }
        }

        // Get or create user session if accessing via share link
        if (urlStreamId) {
          const { data: shareLink } = await supabase
            .from('share_links')
            .select('*')
            .eq('stream_id', urlStreamId)
            .single()

          if (shareLink) {
            // Update user session
            await supabase
              .from('user_sessions')
              .update({ last_accessed: new Date().toISOString() })
              .eq('stream_id', urlStreamId)
              .eq('user_email', user.email)
          }
        }

        // Set up profile change listener
        if (mounted) {
          channel = supabase
            .channel('profile-changes')
            .on('postgres_changes', 
              { 
                event: '*', 
                schema: 'public', 
                table: 'profiles',
                filter: `id=eq.${user.id}` 
              }, 
              (payload: { new: Profile }) => {
                if (!mounted) return;
                const newProfile = payload.new as Profile
                setProfile(newProfile)
                // Apply dark mode
                if (newProfile.dark_mode) {
                  document.documentElement.classList.add('dark')
                  document.documentElement.style.colorScheme = 'dark'
                } else {
                  document.documentElement.classList.remove('dark')
                  document.documentElement.style.colorScheme = 'light'
                }
              }
            )
            .subscribe()
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      mounted = false;
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [user, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <aside 
          ref={desktopSidebarRef}
          className={`fixed inset-y-0 z-50 hidden lg:flex transition-all duration-200 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}
        >
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onCollapse={handleSidebarCollapse}
          />
        </aside>

        {/* Mobile Sidebar */}
        <aside 
          ref={mobileSidebarRef}
          className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-all duration-200 transform h-full ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-20' : 'w-72'}`}
        >
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onCollapse={handleSidebarCollapse}
          />
        </aside>

        {/* Main Content */}
        <main className={`flex-1 w-full py-6 px-4 sm:px-6 lg:px-8 transition-all duration-200 min-h-screen bg-gray-50 dark:bg-gray-900 ${sidebarCollapsed ? 'lg:pl-28' : 'lg:pl-80'}`}>
          {/* Top Nav */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Hey {profile?.full_name || sharedUserName || user.email?.split('@')[0]} 👋
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Sign Out
            </button>
          </div>
          {children}
        </main>
      </div>

      {/* Customer Drawer */}
      {customer && (
        <CustomerDrawer 
          customer={customer}
          open={isOpen}
          onOpenChange={closeDrawer}
        />
      )}
    </div>
  )
}
