'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/sidebar'
import { Spinner } from '@/components/ui/spinner'

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
  const router = useRouter()
  const [session, setSession] = useState<{ user: User } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sharedUserName, setSharedUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log('Loading session...')
    setLoading(true)

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          setLoading(false)
          return
        }

        setSession(session)

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
        if (urlStreamId && session.user.email === 'anonymous@example.com') {
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
          .eq('id', session.user.id)
          .single()

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
              .eq('user_email', session.user.email)
          }
        }

        if (profile) {
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

        // Set up profile change listener
        const channel = supabase
          .channel('profile-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'profiles',
              filter: `id=eq.${session.user.id}` 
            }, 
            (payload) => {
              console.log('Profile updated:', payload)
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

        return () => {
          channel.unsubscribe()
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 z-50 flex w-72">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full py-6 px-4 sm:px-6 lg:px-8 lg:pl-80 bg-gray-50 dark:bg-gray-900 min-h-screen">
          {/* Top Nav */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Hey {profile?.full_name || sharedUserName || session.user.email?.split('@')[0]} 👋
            </h1>
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
    </div>
  )
}
