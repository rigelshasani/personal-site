// src/components/ViewTrackerWithNotification.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { getViewCount, formatViewCount } from '@/lib/view-counter';
import { ViewNotification } from './ViewNotification';

interface Props {
  slug: string;
  className?: string;
}

export function ViewTrackerWithNotification({ slug, className = '' }: Props) {
  const [count, setCount] = useState(() => getViewCount(slug));
  const last = useRef<number>(count);
  const [justIncremented, setJustIncremented] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // initial refresh (server fetch is de-duped + TTL inside getViewCount)
    const c = getViewCount(slug);
    setCount(c);
    last.current = c;

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== 'blog-view-counts') return;
      const next = getViewCount(slug);
      if (next > last.current) {
        setJustIncremented(true);
        setShowNotification(true);
        setTimeout(() => setJustIncremented(false), 1500);
      }
      last.current = next;
      setCount(next);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [slug]);

  if (count === 0) return null;

  return (
    <>
      <span
        className={`inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 transition-all duration-500 ${
          justIncremented ? 'text-green-600 dark:text-green-400 scale-110' : ''
        } ${className}`}
      >
        <svg
          className={`w-4 h-4 transition-all duration-500 ${
            justIncremented ? 'text-green-600 dark:text-green-400' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <span className={`transition-all duration-500 ${justIncremented ? 'font-semibold' : ''}`}>
          {formatViewCount(count)}
          {justIncremented && <span className="ml-1 text-green-600 dark:text-green-400 animate-pulse">+1</span>}
        </span>
      </span>

      <ViewNotification show={showNotification} onComplete={() => setShowNotification(false)} />
    </>
  );
}
