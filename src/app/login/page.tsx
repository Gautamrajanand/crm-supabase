'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from '../../types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import Logo from '../../components/logo';
import { useAuth } from '../auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, supabase } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    const next = searchParams.get('next') || '/dashboard';
    router.replace(next);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const next = searchParams.get('next') || '/dashboard';

      // Sign in with email and password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Auth context will handle the redirect
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError(error?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Logo />
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-orange-500 hover:text-orange-400 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 rounded-md px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 rounded-md px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
