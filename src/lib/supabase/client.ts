import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const cookieOptions = {
  name: 'sb-session',
  domain: process.env.NEXT_PUBLIC_DOMAIN,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
}

export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions
    }
  )
}
