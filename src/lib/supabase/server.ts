import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { getCookie, setCookie, removeCookie } from '@/app/actions'

const cookieOptions = {
  name: 'sb-session',
  domain: process.env.NEXT_PUBLIC_DOMAIN,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
}

export function createServerSupabase() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          try {
            return await getCookie(name)
          } catch (error) {
            console.error('Error getting cookie:', error)
            return undefined
          }
        },
        set: async (name: string, value: string) => {
          try {
            await setCookie(name, value)
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove: async (name: string) => {
          try {
            await removeCookie(name)
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        }
      },
      cookieOptions
    }
  )
}
