'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

type AuthContextType = {
  isLoading: boolean;
  user: any | null;
  supabase: ReturnType<typeof createBrowserClient>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  user: null,
  supabase: createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Create Supabase client once
  const supabase = React.useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
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
    supabase,
    signOut: async () => {
      try {
        await supabase.auth.signOut()
        setUser(null)
        router.replace('/')
      } catch (error) {
        console.error('Error signing out:', error)
        toast.error('Error signing out')
      }
    },
  }), [isLoading, user, supabase, router])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
