'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabase } from '@/utils/supabase'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserSupabase()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null)

  useEffect(() => {
    const invitationId = searchParams.get('id')
    if (!invitationId) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    // First get the invitation details
    async function handleInvitation() {
      try {
        // Get the invitation first
        const response = await fetch(`/api/invitations/${invitationId}`)
        const data = await response.json()

        if (!response.ok || !data) {
          setError(data.error || 'Invitation not found')
          setLoading(false)
          return
        }

        const invitation = data

        if (invitation.status !== 'pending') {
          setError('This invitation has already been used')
          setLoading(false)
          return
        }

        // Store the invited email
        setInvitedEmail(invitation.email)

        // Check auth state
        const { data: { session } } = await supabase.auth.getSession()

        // If not logged in or wrong email, show login prompt
        if (!session || session.user.email !== invitedEmail) {
          setLoading(false) // Keep showing the UI with login instructions
          return
        }

        // Verify email matches
        if (invitation.email !== session.user.email) {
          setError('This invitation is for a different email address')
          setLoading(false)
          return
        }

        // Accept the invitation
        const acceptResponse = await fetch(`/api/invitations/${invitationId}/accept`, {
          method: 'POST',
        })
        const acceptData = await acceptResponse.json()

        if (!acceptResponse.ok) {
          setError(acceptData.error || 'Failed to accept invitation')
          setLoading(false)
          return
        }

        // Redirect to dashboard
        router.replace('/dashboard')
      } catch (err) {
        console.error('Error accepting invitation:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    handleInvitation()
  }, [searchParams, router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <h1 className="mb-4 text-2xl font-semibold text-foreground">Error</h1>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  // Show login instructions if we have the invited email
  if (invitedEmail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-foreground">Accept Team Invitation</h1>
          <p className="mb-6 text-muted-foreground">
            Please sign in or create an account with <strong>{invitedEmail}</strong> to accept this invitation.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              href={`/login?email=${encodeURIComponent(invitedEmail)}&returnUrl=${encodeURIComponent(
                `/accept-invitation?id=${searchParams.get('id')}`
              )}`}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Link>
            <Link
              href={`/signup?email=${encodeURIComponent(invitedEmail)}&returnUrl=${encodeURIComponent(
                `/accept-invitation?id=${searchParams.get('id')}`
              )}`}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  )
}
