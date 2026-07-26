'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Get return URL from query params
  const returnUrl = searchParams.get('returnUrl') || '/timeline';

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Check your email for the magic link to log in!',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred during login',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 px-6">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Welcome Back
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Sign in to access your financial rebuilding timeline
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleMagicLinkLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>How it works:</strong> We'll send you a magic link via email. Click the link to securely sign in without a password. This method works great even if you don't have a permanent address.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
