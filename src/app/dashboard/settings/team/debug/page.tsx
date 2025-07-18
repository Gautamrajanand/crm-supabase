'use client'

import { createBrowserSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/app/auth-provider'

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const handleFixOwner = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!email) {
        throw new Error('No user email found')
      }

      const response = await fetch('/api/debug/fix-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fix owner')
      }

      // Redirect back to team page
      router.push('/dashboard/settings/team')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Debug Tools</h1>
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-800 mb-2">⚠️ Warning</h2>
          <p className="text-sm text-red-600 mb-4">
            These tools are for debugging purposes only. Use with caution.
          </p>
          <button
            onClick={handleFixOwner}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Fixing...' : 'Fix Owner Permissions'}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
