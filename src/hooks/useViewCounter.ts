// src/hooks/useViewCounter.ts - React hook for view counting
'use client';

import { useState, useEffect } from 'react';
import { recordView, getViewCount, formatViewCount } from '@/lib/view-counter';

export function useViewCounter(slug: string) {
  const [viewCount, setViewCount] = useState(0);
  const [isRecorded, setIsRecorded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Get initial count
    const initialCount = getViewCount(slug);
    setViewCount(initialCount);

    // Record view after a short delay to ensure user actually viewed the content
    const timer = setTimeout(() => {
      if (!isRecorded) {
        const newCount = recordView(slug);
        setViewCount(newCount);
        setIsRecorded(true);
      }
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [slug, isRecorded]);

  return {
    viewCount,
    formattedViewCount: formatViewCount(viewCount),
    isRecorded
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