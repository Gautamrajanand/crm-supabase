import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Set RLS header
  res.headers.set('x-enforce-rls', 'true')

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth required routes
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/join')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      
      // For join links, preserve the email
      if (req.nextUrl.pathname.startsWith('/join')) {
        const email = req.nextUrl.searchParams.get('email')
        if (email) loginUrl.searchParams.set('email', email)
        loginUrl.searchParams.set('mode', 'signup')
        loginUrl.searchParams.set('next', req.nextUrl.pathname)
      }
      
      return NextResponse.redirect(loginUrl)
    }
    
    // For join links, check if email matches
    if (req.nextUrl.pathname.startsWith('/join')) {
      const inviteEmail = req.nextUrl.searchParams.get('email')
      if (inviteEmail && session.user.email !== inviteEmail) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('email', inviteEmail)
        loginUrl.searchParams.set('mode', 'signup')
        loginUrl.searchParams.set('next', req.nextUrl.pathname)
        
        // Clear the session
        const response = NextResponse.redirect(loginUrl)
        await supabase.auth.signOut()
        return response
      }
    }
  }

  // Auth pages (when already logged in)
  if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
