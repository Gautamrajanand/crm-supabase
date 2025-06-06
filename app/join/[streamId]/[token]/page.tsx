'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export default function JoinPage({
  params: { streamId, token },
}: {
  params: { streamId: string; token: string }
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const init = async () => {
      try {
        // Get the invite
        const { data: invites, error: inviteError } = await supabase
          .from('revenue_stream_invites')
          .select('email, role')
          .eq('token', token)
          .eq('stream_id', streamId)
          .is('accepted_at', null)
          .gte('expires_at', new Date().toISOString())

        if (inviteError) {
          console.error('Error getting invite:', inviteError)
          setError('Error checking invite')
          return
        }

        if (!invites || invites.length === 0) {
          setError('Invalid or expired invite link')
          return
        }

        const invite = invites[0]

        // Check if user is logged in
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error('Error getting user:', userError)
          setError('Error checking user')
          return
        }

        if (user) {
          // If user is logged in, add them to the stream
          const { error: memberError } = await supabase
            .from('revenue_stream_members')
            .insert({
              stream_id: streamId,
              user_id: user.id,
              role: 'member',
              permissions: JSON.stringify({
                outreach: 'view',
                deals: 'view',
                customers: 'view',
                tasks: 'view',
                calendar: 'view'
              })
            } as any)

          if (memberError) {
            setError('Error adding you to the stream')
            return
          }

          // Mark invite as accepted
          const { error: acceptError } = await supabase
            .from('revenue_stream_invites')
            .update({ accepted_at: new Date().toISOString() })
            .eq('token', token)

          if (acceptError) {
            setError('Error accepting invite')
            return
          }

          // Redirect to stream
          window.location.href = `/dashboard?stream=${streamId}`
        } else {
          // If user is not logged in, redirect to signup
          window.location.href = `/signup/${streamId}/${token}`
        }
      } catch (error: any) {
        console.error('Error:', error)
        setError('An unexpected error occurred')
      }
    }

    void init()
  }, [streamId, token, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Joining stream...</h2>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-xl mb-4">❌</div>
            <h2 className="text-lg font-semibold text-red-500">{error}</h2>
          </>
        ) : null}
      </div>
    </div>
  )
}
