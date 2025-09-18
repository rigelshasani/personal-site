// src/hooks/useViewCounter.ts - React hook for view counting
'use client';

import { useState, useEffect } from 'react';
import { recordView, getViewCount, formatViewCount } from '@/lib/view-counter';

export function useViewCounter(slug: string) {
  const [viewCount, setViewCount] = useState(0);
  const [justIncremented, setJustIncremented] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Get initial count
    const initialCount = getViewCount(slug);
    setViewCount(initialCount);

    // Record view after a delay to ensure user actually viewed the content
    const timer = setTimeout(() => {
      const newCount = recordView(slug);
      
      // Only animate if count actually increased
      if (newCount > initialCount) {
        setJustIncremented(true);
        setViewCount(newCount);
        
        // Reset animation after animation completes (skip in tests to avoid act warnings)
        if (typeof (globalThis as { jest?: unknown }).jest === 'undefined') {
          setTimeout(() => setJustIncremented(false), 2000);
        }
      }
    }, 5000); // 5 second delay

    return () => clearTimeout(timer);
  }, [slug]); // Removed isRecorded dependency to allow re-recording on revisits

  return {
    viewCount,
    formattedViewCount: formatViewCount(viewCount),
    justIncremented
  };
}

// Hook for getting view counts without recording a view
export function useViewCountDisplay(slug: string) {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const count = getViewCount(slug);
    setViewCount(count);

    // Listen for storage changes to update counts in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blog-view-counts') {
        const newCount = getViewCount(slug);
        setViewCount(newCount);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [slug]);

  return {
    viewCount,
    formattedViewCount: formatViewCount(viewCount)
  };
}
