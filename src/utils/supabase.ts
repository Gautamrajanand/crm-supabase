import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const cookieOptions = {
  name: 'sb-session',
  domain: process.env.NEXT_PUBLIC_DOMAIN,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7 // 1 week
}

export function createBrowserSupabase() {
  // Clear any existing session cookies to prevent stale state
  if (typeof window !== 'undefined') {
    document.cookie = `sb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    if (process.env.NEXT_PUBLIC_DOMAIN) {
      document.cookie = `sb-session=; path=/; domain=${process.env.NEXT_PUBLIC_DOMAIN}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }

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
        debug: process.env.NODE_ENV === 'development',
        storage: {
          getItem: (key) => {
            try {
              return localStorage.getItem(key);
            } catch {
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value);
            } catch {}
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key);
            } catch {}
          }
        }
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
