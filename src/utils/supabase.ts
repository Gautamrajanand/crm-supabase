import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const cookieOptions = {
  name: 'sb-session',
  domain: 'crm-supabase-345427578.vercel.app',
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
