import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export function createServerSupabase() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Error setting cookie:', error)
            // Fallback to setting without options in development
            if (process.env.NODE_ENV === 'development') {
              cookieStore.set({ name, value })
            }
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            console.error('Error removing cookie:', error)
            // Fallback to removing without options in development
            if (process.env.NODE_ENV === 'development') {
              cookieStore.delete({ name })
            }
          }
        },
      },
    }
  )
}
