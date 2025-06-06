'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

export default function SharePage({ params }: { params: { linkId: string } }) {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAccess()
  }, [params.linkId])

  const checkAccess = async () => {
    setLoading(true)
    try {
      // Check if we have a session
      const { data: { session } } = await supabase.auth.getSession()
      
      // If no session, sign in anonymously
      if (!session) {
        console.log('No session, signing in anonymously...')
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: 'anonymous@example.com',
          password: 'anonymous'
        })
        if (signInError) {
          console.error('Error signing in anonymously:', signInError)
          toast.error('Error accessing link')
          setLoading(false)
          return
        }
      }

      // Now check the share link
      console.log('Checking share link:', params.linkId)
      const { data: shareLink, error: linkError } = await supabase
        .from('stream_invitations')
        .select('stream_id, access_level, expires_at')
        .eq('id', params.linkId)
        .single()

      console.log('Share link result:', { shareLink, linkError })

      if (linkError) {
        console.error('Error fetching share link:', linkError)
        toast.error('Invalid or expired link')
        setLoading(false)
        return
      }

      if (!shareLink) {
        toast.error('Link not found')
        setLoading(false)
        return
      }

      if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
        toast.error('This link has expired')
        setLoading(false)
        return
      }

      setLoading(false)
    } catch (error) {
      console.error('Error checking access:', error)
      toast.error('Error checking access')
      setLoading(false)
    }

  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form...')
    e.preventDefault()
    if (!userName.trim()) {
      toast.error('Please enter your name')
      return
    }

    try {
      setLoading(true)
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('No session, signing in anonymously...')
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: 'anonymous@example.com',
          password: 'anonymous'
        })
        if (signInError) {
          console.error('Error signing in anonymously:', signInError)
          toast.error('Error accessing link')
          setLoading(false)
          return
        }
      }

      console.log('Getting share link details...')
      const { data: shareLink, error: linkError } = await supabase
        .from('stream_invitations')
        .select('stream_id, access_level')
        .eq('id', params.linkId)
        .single()

      if (linkError) {
        console.error('Error fetching share link:', linkError)
        toast.error('Error accessing stream')
        return
      }

      if (!shareLink) {
        toast.error('Invalid link')
        return
      }

      console.log('Creating user session...')
      
      // Update anonymous user's profile name
      if (session?.user.email === 'anonymous@example.com') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: userName })
          .eq('id', session.user.id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          return {
            error: 'Failed to update profile'
          }
        }
      }

      console.log('Logging access...')
      // Only track contribution if we have a valid stream_id
      if (shareLink.stream_id) {
        const { error: contributionError } = await supabase.rpc('track_contribution', {
          p_user_name: userName,
          p_user_email: session?.user.email || 'anonymous@example.com',
          p_contribution_type: 'outreach_created',
          p_entity_id: shareLink.stream_id,
          p_entity_name: 'stream_invitation',
          p_details: { access_level: shareLink.access_level }
        })

        if (contributionError) {
          console.error('Error logging access:', contributionError)
          return {
            error: 'Failed to log access'
          }
        }
      }



      router.push(`/dashboard?stream=${shareLink.stream_id}`)
    } catch (error) {
      toast.error('Error accessing stream')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Access Revenue Stream
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your name to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  )
}
