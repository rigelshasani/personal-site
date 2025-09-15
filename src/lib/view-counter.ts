// src/lib/view-counter.ts - Anonymous view counting system
'use client';

interface ViewData {
  slug: string;
  views: number;
  lastViewed: string;
  sessionViewed: boolean;
}

const STORAGE_KEY = 'blog-view-counts';
const SESSION_KEY = 'current-session-views';

// Get all view data from localStorage
function getViewData(): Record<string, ViewData> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save view data to localStorage
function saveViewData(data: Record<string, ViewData>) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Could not save view data:', error);
  }
}


// Record a view for a post
export function recordView(slug: string): number {
  if (typeof window === 'undefined') return 0;
  
  const viewData = getViewData();
  
  // Initialize or update view data
  if (!viewData[slug]) {
    viewData[slug] = {
      slug,
      views: 0,
      lastViewed: new Date().toISOString(),
      sessionViewed: false
    };
  }
  
  // Always increment view count (no session restriction)
  viewData[slug].views += 1;
  viewData[slug].lastViewed = new Date().toISOString();
  viewData[slug].sessionViewed = true;
  
  // Save data
  saveViewData(viewData);
  
  return viewData[slug].views;
}

// Get view count for a post
export function getViewCount(slug: string): number {
  const viewData = getViewData();
  return viewData[slug]?.views || 0;
}

// Get all view counts
export function getAllViewCounts(): Record<string, number> {
  const viewData = getViewData();
  const counts: Record<string, number> = {};
  
  Object.values(viewData).forEach(data => {
    counts[data.slug] = data.views;
  });
  
  return counts;
}

// Get popular posts (top N by view count)
export function getPopularPosts(limit: number = 5): Array<{ slug: string; views: number }> {
  const viewData = getViewData();
  
  return Object.values(viewData)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map(data => ({
      slug: data.slug,
      views: data.views
    }));
}

// Format view count for display
export function formatViewCount(count: number): string {
  if (count === 0) return '0 views';
  if (count === 1) return '1 view';
  if (count < 1000) return `${count} views`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k views`;
  return `${(count / 1000000).toFixed(1)}M views`;
}

// Debug function to clear all view data
export function clearAllViews() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

// Export view data (for backup/analysis)
export function exportViewData(): string {
  const viewData = getViewData();
  return JSON.stringify(viewData, null, 2);
}
