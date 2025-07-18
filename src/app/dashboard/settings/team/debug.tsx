'use client'

import { useState } from 'react'

export default function DebugTools() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFixOwner = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/debug/fix-owner', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fix owner')
      }

      setSuccess(true)
      // Reload the page after 1 second
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-lg font-medium mb-4">Debug Tools</h3>
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
      {success && (
        <p className="mt-2 text-sm text-green-600">
          Success! Reloading page...
        </p>
      )}
    </div>
  )
}
