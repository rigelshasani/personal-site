// src/components/ViewTrackerWithNotification.tsx - View tracker with visual notification
'use client';

import { useState } from 'react';
import { useViewCounter } from '@/hooks/useViewCounter';
import { ViewNotification } from './ViewNotification';
import { formatViewCount } from '@/lib/view-counter';

interface ViewTrackerWithNotificationProps {
  slug: string;
  className?: string;
}

export function ViewTrackerWithNotification({ slug, className = "" }: ViewTrackerWithNotificationProps) {
  const { viewCount, formattedViewCount, justIncremented } = useViewCounter(slug);
  const [showNotification, setShowNotification] = useState(false);

  // Show notification when view is incremented
  if (justIncremented && !showNotification) {
    setShowNotification(true);
  }

  // Don't render anything if no views yet
  if (viewCount === 0) return null;

  return (
    <>
      <span className={`inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 transition-all duration-500 ${
        justIncremented ? 'text-green-600 dark:text-green-400 scale-110' : ''
      } ${className}`}>
        <svg 
          className={`w-4 h-4 transition-all duration-500 ${
            justIncremented ? 'text-green-600 dark:text-green-400' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
          />
        </svg>
        <span className={`transition-all duration-500 ${
          justIncremented ? 'font-semibold' : ''
        }`}>
          {formattedViewCount}
          {justIncremented && (
            <span className="ml-1 text-green-600 dark:text-green-400 animate-pulse">
              +1
            </span>
          )}
        </span>
      </span>

      <ViewNotification 
        show={showNotification} 
        onComplete={() => setShowNotification(false)}
      />
    </>
  );
}