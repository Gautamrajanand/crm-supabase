'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'

export function TestConnection() {
  const [status, setStatus] = useState('Not tested')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function testConnection() {
    try {
      setStatus('Testing...')
      
      // Log the config
      console.log('Config:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })

      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        throw error
      }

      setStatus('Connected successfully!')
      console.log('Test query result:', data)
    } catch (err) {
      console.error('Connection error:', err)
      setStatus('Connection failed: ' + (err as Error).message)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-medium mb-4">Supabase Connection Test</h3>
      <p className="mb-4">Status: {status}</p>
      <button
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Connection
      </button>
    </div>
  )
}
