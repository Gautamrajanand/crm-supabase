'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { InvitationService } from '@/lib/services/invitation'
import { Invitation } from '@/types/invitation'

// Component Props
interface InvitePageProps {
  params: { token: string }
}

export default function InvitePage({ params }: InvitePageProps) {
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<Invitation | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const invitationService = new InvitationService()

  useEffect(() => {
    async function loadInvitation() {
      try {
        const invitation = await invitationService.getInvitation(params.token)
        
        if (!invitation) {
          toast.error('Invalid invite link')
          router.push('/login')
          return
        }

        // Check if invite has expired
        if (new Date(invitation.expires_at) < new Date()) {
          toast.error('This invite link has expired')
          router.push('/login')
          return
        }

        // Check if invite has already been accepted
        if (invitation.status !== 'pending') {
          toast.error('This invite has already been used')
          router.push('/login')
          return
        }

        setInvite(invitation)
      } catch (error) {
        console.error('Error loading invitation:', error)
        toast.error('Failed to load invitation')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadInvitation()
  }, [params.token, router])

  const handleAcceptInvite = async () => {
    try {
      if (!invite) return

      if (password !== confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }

      setIsSubmitting(true)
      const response = await invitationService.acceptInvitation(params.token, password)

      if (!response.success) {
        toast.error(response.error || 'Failed to accept invitation')
        return
      }

      toast.success(response.message || 'Successfully joined!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast.error('Failed to process invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Accept Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            You have been invited to join the team. Click below to get started.
          </p>
        </div>
        <div className="mt-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAcceptInvite}
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
