import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-session',
        domain: process.env.NEXT_PUBLIC_DOMAIN,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      },
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // If user is signed in and the current path starts with /login
    if (session && request.nextUrl.pathname.startsWith('/login')) {
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is not signed in and the current path starts with /dashboard
    if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Handle stream selection for authenticated dashboard routes
    // This ensures proper stream context is maintained across navigation
    if (session && request.nextUrl.pathname.startsWith('/dashboard')) {
      const currentStreamId = request.cookies.get('currentStreamId')?.value
      const urlStreamId = request.nextUrl.searchParams.get('stream')

      // If no stream in URL but we have one in cookies, add it to URL
      if (!urlStreamId && currentStreamId) {
        const url = new URL(request.url)
        // Preserve the original pathname
        url.pathname = request.nextUrl.pathname
        url.searchParams.set('stream', currentStreamId)
        return NextResponse.redirect(url)
      }

      // If no stream selected at all, redirect to settings
      if (!currentStreamId && !urlStreamId && !request.nextUrl.pathname.startsWith('/dashboard/settings')) {
        const redirectUrl = new URL('/dashboard/settings', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
