import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CRM',
  description: 'CRM built with Next.js and Supabase',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} ${plusJakarta.variable} h-full bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-150`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
