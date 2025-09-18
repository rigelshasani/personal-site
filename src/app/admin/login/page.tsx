'use client';

import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;
    // If authenticated and admin, go to dashboard. Middleware will handle non-admins.
    router.replace('/admin');
  }, [status, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-border-light dark:border-gray-800 rounded-2xl p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
        <p className="text-center text-text-mid mb-6">
          Sign in with GitHub to access the admin dashboard.
        </p>

        <button
          onClick={() => signIn('github')}
          className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="fill-current">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Continue with GitHub
        </button>

        <p className="text-center text-xs text-text-mid mt-4">
          Access is limited to approved accounts.
        </p>
      </div>
    </div>
  );
}

