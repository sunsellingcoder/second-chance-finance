import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 px-6">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Authentication Error
            </h1>
            
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              There was a problem signing you in. This might be because the magic link has expired or was already used.
            </p>

            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors text-center"
              >
                Try Again
              </Link>
              
              <Link
                href="/"
                className="block w-full border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 py-3 rounded-lg font-medium transition-colors text-center"
              >
                Return to Home
              </Link>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Troubleshooting:</strong> Magic links expire after 24 hours and can only be used once. Request a new magic link if you continue to see this error.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
