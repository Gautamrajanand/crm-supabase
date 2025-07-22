import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const cookieOptions = {
  name: 'sb-session',
  domain: process.env.NEXT_PUBLIC_DOMAIN,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
}

export function createBrowserSupabase() {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development'
      },
      global: {
        headers: {
          'x-client-info': 'crm-supabase'
        }
      }
    }
  )

  return client
}
