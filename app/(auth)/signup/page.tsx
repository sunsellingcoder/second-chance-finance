'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const router = useRouter();
  
  // Check if environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment check:', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseKey,
    urlPrefix: supabaseUrl?.substring(0, 20) + '...'
  });
  
  const supabase = createClient();

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Check if environment variables are configured
    if (!supabaseUrl || !supabaseKey) {
      setMessage({
        type: 'error',
        text: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.',
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting signup with email:', email);
      console.log('Redirect URL:', `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent('/timeline')}`);
      console.log('Supabase URL:', supabaseUrl);
      console.log('Window origin:', window.location.origin);

      // Try with the redirect URL
      console.log('Attempting signInWithOtp with redirect URL...');
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent('/timeline')}`,
        },
      });

      console.log('Full response:', JSON.stringify({ data, error }, null, 2));

      if (error) {
        console.log('Error type:', error.constructor.name);
        console.log('Error properties:', Object.keys(error));
        console.log('Error message:', error.message);
        console.log('Error status:', error.status);
        
        // Try to get more error details
        if (error instanceof Error) {
          console.log('Error stack:', error.stack);
        }
        
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Check your email for the magic link to sign up!',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error?.message || 
                          error?.error_description || 
                          JSON.stringify(error) || 
                          'An error occurred during signup';
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      console.log('Attempting fallback signup (demo mode)...');
      
      // Generate a random password for demo purposes
      const demoPassword = Math.random().toString(36).slice(-10);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: demoPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent('/timeline')}`,
          data: {
            demo_mode: true
          }
        }
      });

      console.log('Fallback signup response:', { data, error });

      if (error) {
        // If signup fails, try to sign in instead (user might already exist)
        console.log('Signup failed, trying to sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: demoPassword,
        });

        if (signInError) {
          throw signInError;
        }

        setMessage({
          type: 'success',
          text: 'Demo mode: You are now signed in! (Email not sent due to configuration issues)',
        });
        
        setTimeout(() => {
          router.push('/timeline');
        }, 1500);
      } else {
        setMessage({
          type: 'success',
          text: 'Demo mode: Account created! You are now signed in. (Email not sent due to configuration issues)',
        });
        
        setTimeout(() => {
          router.push('/timeline');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Fallback signup error:', error);
      const errorMessage = error?.message || 
                          error?.error_description || 
                          JSON.stringify(error) || 
                          'An error occurred during demo signup';
      
      setMessage({
        type: 'error',
        text: errorMessage,
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
              Create Your Account
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Start your financial rebuilding journey today
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

          <form onSubmit={useFallback ? handleFallbackSignup : handleMagicLinkSignup} className="space-y-6">
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
              {loading ? (useFallback ? 'Creating Account...' : 'Sending Magic Link...') : (useFallback ? 'Sign Up (Demo Mode)' : 'Sign Up with Magic Link')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setUseFallback(!useFallback)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {useFallback ? '← Try Magic Link Instead' : 'Email not working? Try Demo Mode'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>How it works:</strong> We'll send you a magic link via email. Click the link to securely create your account and sign in without a password. This method works great even if you don't have a permanent address.
            </p>
            {useFallback && (
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-2">
                <strong>Demo Mode:</strong> Creates an account without email verification. Perfect for testing the application immediately.
              </p>
            )}
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}