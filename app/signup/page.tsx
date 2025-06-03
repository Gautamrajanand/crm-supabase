'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
        // 1. Sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          if (signUpError.message.includes('User already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw signUpError;
        }

        if (!signUpData.user) {
          console.error('No user data returned:', signUpData);
          throw new Error('Failed to create account. Please try again.');
        }

        // 1. Create workspace and add user as owner in a single transaction
        const { data: workspaceId, error: workspaceError } = await supabase.rpc('create_workspace', {
          p_name: workspaceName,
          p_description: `Workspace for ${workspaceName}`,
          p_user_id: signUpData.user.id
        });

        if (workspaceError) {
          console.error('Workspace creation error:', workspaceError);
          throw new Error('Failed to create workspace. Please try again.');
        }

        // 2. Create initial revenue stream and add user as owner
        const { data: streamId, error: streamError } = await supabase.rpc('create_revenue_stream', {
          p_name: 'Main Revenue Stream',
          p_description: `Main revenue stream for ${workspaceName}`,
          p_workspace_id: workspaceId,
          p_user_id: signUpData.user.id
        });

        if (streamError) {
          console.error('Revenue stream creation error:', streamError);
          throw new Error('Failed to set up revenue stream. Please try again.');
        }

        // Set the new stream as current and clear any existing data
        localStorage.removeItem('currentStreamId');
        document.cookie = 'currentStreamId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
        
        // Set the new stream
        localStorage.setItem('currentStreamId', streamId);
        document.cookie = `currentStreamId=${streamId};path=/`;

        // Success - show message and redirect to email verification
        const successMessage = 'Please check your email to verify your account.';
        setMessage(successMessage);
        router.push(`/login?message=${encodeURIComponent(successMessage)}`);
        router.refresh(); // Ensure all state is refreshed
      } catch (error) {
        console.error('Signup process error:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred during signup. Please try again.'
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Logo />
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Create your workspace
          </h1>
          <p className="text-sm text-gray-400">
            Get started with your new CRM experience
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
            />

            <Input
              id="workspaceName"
              name="workspaceName"
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Workspace Name"
              className="w-full bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
            />

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
            />

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <>
                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="text-center text-sm">
            <Link 
              href="/login" 
              className="text-orange-500 hover:text-orange-400 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
