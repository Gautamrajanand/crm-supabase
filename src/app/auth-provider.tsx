'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserSupabase } from '@/utils/supabase'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  supabase: ReturnType<typeof createBrowserSupabase>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  user: null,
  session: null,
  supabase: createBrowserSupabase(),
  signOut: async () => {},
  signIn: async () => {},
  signUp: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Create Supabase client once
  const supabase = React.useMemo(() => createBrowserSupabase(), [])

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setSession(null)
          setIsLoading(false)
          return
        }

        // Handle invite flow
        if (pathname.startsWith('/join/')) {
          const params = new URLSearchParams(window.location.search)
          const inviteEmail = params.get('email')
          
          // If logged in with wrong email, sign out and redirect
          if (session?.user && inviteEmail && session.user.email !== inviteEmail) {
            await supabase.auth.signOut()
            setUser(null)
            setIsLoading(false)
            
            // Redirect to login with proper params
            const loginUrl = new URL('/login', window.location.origin)
            loginUrl.searchParams.set('email', inviteEmail)
            loginUrl.searchParams.set('mode', 'signup')
            loginUrl.searchParams.set('next', pathname)
            
            router.push(loginUrl.toString())
            return
          }
        }

        setUser(session?.user || null)
        setIsLoading(false)
      } catch (error) {
        console.error('Error in getSession:', error)
        setUser(null)
        setSession(null)
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          if (pathname !== '/') {
            router.replace('/')
          }
          return
        }
        
        // Handle invite flow
        if (pathname.startsWith('/join/')) {
          const params = new URLSearchParams(window.location.search)
          const inviteEmail = params.get('email')
          
          // If logged in with wrong email, sign out and redirect
          if (session?.user && inviteEmail && session.user.email !== inviteEmail) {
            await supabase.auth.signOut()
            setUser(null)
            setIsLoading(false)
            
            // Redirect to login with proper params
            const loginUrl = new URL('/login', window.location.origin)
            loginUrl.searchParams.set('email', inviteEmail)
            loginUrl.searchParams.set('mode', 'signup')
            loginUrl.searchParams.set('next', pathname)
            
            router.replace(loginUrl.toString())
            return
          }
        }

        setUser(session?.user || null)
        setIsLoading(false)
      } catch (error) {
        console.error('Error in auth state change:', error)
        setUser(null)
        setSession(null)
        setIsLoading(false)
        if (pathname.startsWith('/dashboard')) {
          router.replace('/login')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, supabase])

  const value = React.useMemo(() => ({
    isLoading,
    user,
    session,
    supabase,
    signOut: async () => {
      try {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        router.replace('/')
      } catch (error) {
        console.error('Error signing out:', error)
        toast.error('Error signing out')
      }
    },
    signIn: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.error('Error signing in:', error)
          if (error.status === 429) {
            toast.error('Too many attempts. Please wait a moment.')
          } else {
            toast.error(error.message || 'Error signing in')
          }
          throw error
        }
        setUser(data.user)
        setSession(data.session)
        router.replace('/dashboard')
      } catch (error: any) {
        // Don't update state on error
        throw error
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setUser(data.user)
        setSession(data.session)
        router.replace('/dashboard')
      } catch (error) {
        console.error('Error signing up:', error)
        toast.error('Error signing up')
        throw error
      }
    },
  }), [isLoading, user, session, supabase, router])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
