'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export function AdminLoginButton() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  
  if (status === 'loading') return null;
  
  const userIsAdmin = session?.user?.login && 
    process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS?.split(',').includes(session.user.login);
  
  if (session && userIsAdmin) {
    return (
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        <Link
          href="/admin/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors font-medium shadow-lg"
          title="Create New Post"
        >
          ➕ New Post
        </Link>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
          >
            Admin
          </Link>
          <button
            onClick={() => signOut()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed bottom-2 right-2 z-50"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div 
        className={`transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-10'
        }`}
      >
        <button
          onClick={() => signIn('github')}
          className="bg-gray-800 hover:bg-gray-900 text-white px-2 py-1 rounded text-xs transition-all hover:scale-105"
        >
          •
        </button>
      </div>
    </div>
  );
}