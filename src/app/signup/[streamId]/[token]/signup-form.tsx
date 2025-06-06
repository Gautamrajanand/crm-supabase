'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SignUpFormProps {
  email: string
  streamId: string
  token: string
}

export default function SignUpForm({ email, streamId, token }: SignUpFormProps) {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }

      // Sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      // Mark invite as accepted
      const { error: acceptError } = await supabase
        .from('revenue_stream_invites')
        .update({ accepted_at: new Date().toISOString() })
        .eq('token', token)

      if (acceptError) throw acceptError

      // Add user to stream members
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) throw new Error('No session')

      const { data: invite } = await supabase
        .from('revenue_stream_invites')
        .select('role')
        .eq('token', token)
        .single()

      if (!invite) throw new Error('No invite found')

      const { error: memberError } = await supabase
        .from('revenue_stream_members')
        .insert({
          profile_id: session.session.user.id,
          stream_id: streamId,
          role: invite.role as 'admin' | 'member' | 'viewer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (memberError) throw memberError

      // Redirect to stream
      router.push(`/dashboard?stream=${streamId}`)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="mb-6 text-2xl font-semibold">Create your account</h1>
          <form onSubmit={handleSignUp}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
