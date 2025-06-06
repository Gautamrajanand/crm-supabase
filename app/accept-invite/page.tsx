'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function acceptInvite() {
      try {
        const token = searchParams.get('token')
        if (!token) {
          toast.error('Invalid invitation link')
          router.push('/login')
          return
        }

        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }

        if (!session) {
          console.log('No session, redirecting to login...')
          // Save token and redirect to login
          localStorage.setItem('inviteToken', token)
          router.push('/login')
          return
        }

        // First check if the invitation exists and is valid
        const { data: invitation, error: inviteError } = await supabase
          .from('workspace_invitations')
          .select('*')
          .eq('id', token)
          .single()

        if (inviteError || !invitation) {
          console.error('Invitation error:', inviteError)
          throw new Error('Invalid invitation')
        }

        if (invitation.email !== session.user.email) {
          throw new Error('This invitation was sent to a different email address')
        }

        if (new Date(invitation.expires_at) < new Date()) {
          throw new Error('This invitation has expired')
        }

        console.log('Accepting invitation with token:', token)
        const { data, error } = await supabase
          .rpc('accept_invitation', { invitation_id: token })

        if (error) {
          console.error('RPC error:', error)
          if (error.message?.includes('workspace_members_workspace_id_user_id_key')) {
            // User is already a member, just delete the invitation
            const { data: invitation } = await supabase
              .from('workspace_invitations')
              .select('id')
              .eq('id', token)
              .single()

            if (invitation) {
              await supabase
                .from('workspace_invitations')
                .delete()
                .eq('id', invitation.id)
            }

            toast.info('You are already a member of this workspace')
            return router.push('/dashboard')
          }
          throw error
        }

        if (!data?.success) {
          const errorMsg = data?.error || 'Failed to accept invitation'
          console.error('Accept error:', errorMsg)
          if (errorMsg.includes('already a member')) {
            toast.info('You are already a member of this workspace')
            return router.push('/dashboard')
          }
          throw new Error(errorMsg)
        }

        toast.success('Successfully joined the workspace')
        router.push('/dashboard')
      } catch (error) {
        console.error('Error accepting invitation:', error)
        const message = error instanceof Error ? error.message : 'Failed to accept invitation'
        toast.error(message)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    acceptInvite()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {loading ? 'Accepting invitation...' : 'Redirecting...'}
          </h2>
        </div>
      </div>
    </div>
  )
}
