'use server'

import { cookies } from 'next/headers'

const cookieOptions = {
  name: 'sb-session',
  domain: process.env.NEXT_PUBLIC_DOMAIN,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
}

export async function setCookie(name: string, value: string) {
  cookies().set(name, value, cookieOptions)
}

export async function removeCookie(name: string) {
  cookies().set(name, '', { ...cookieOptions, maxAge: 0 })
}

export async function getCookie(name: string) {
  return cookies().get(name)?.value
}
