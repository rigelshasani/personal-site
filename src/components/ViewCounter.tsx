// src/components/ViewCounter.tsx - Component to display and track view counts
'use client';

import { useViewCounter, useViewCountDisplay } from '@/hooks/useViewCounter';

interface ViewCounterProps {
  slug: string;
  shouldRecord?: boolean; // Whether to record a view or just display
  className?: string;
  showIcon?: boolean;
}

export function ViewCounter({ 
  slug, 
  shouldRecord = false, 
  className = "", 
  showIcon = true 
}: ViewCounterProps) {
  const recordingHook = useViewCounter(slug);
  const displayHook = useViewCountDisplay(slug);
  
  const { viewCount, formattedViewCount, justIncremented } = shouldRecord ? recordingHook : { ...displayHook, justIncremented: false };

  // Don't render anything if no views yet (avoids showing "0 views" everywhere)
  if (viewCount === 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 transition-all duration-500 ${
      justIncremented ? 'text-green-600 dark:text-green-400 scale-110' : ''
    } ${className}`}>
      {showIcon && (
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
      )}
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
  );
}

// Simplified version for showing just the count
export function ViewCount({ slug, className = "" }: { slug: string; className?: string }) {
  return (
    <ViewCounter 
      slug={slug} 
      shouldRecord={false} 
      className={className} 
      showIcon={false} 
    />
  );
}

// Version that records views (use on post pages)
export function ViewTracker({ slug, className = "" }: { slug: string; className?: string }) {
  return (
    <ViewCounter 
      slug={slug} 
      shouldRecord={true} 
      className={className} 
      showIcon={true} 
    />
  );
}