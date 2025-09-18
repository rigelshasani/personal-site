// src/lib/view-counter.ts - Anonymous view counting with server sync
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


async function tryServerGet(slug: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/views/${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.count === 'number' ? data.count : null
  } catch {
    return null
  }
}

async function tryServerPost(slug: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/views/${encodeURIComponent(slug)}`, { method: 'POST' })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.count === 'number' ? data.count : null
  } catch {
    return null
  }
}

// Record a view for a post (server-first, fallback to local)
export function recordView(slug: string): number {
  if (typeof window === 'undefined') return 0;

  // Optimistic local increment for instant feedback
  const viewData = getViewData();
  if (!viewData[slug]) {
    viewData[slug] = { slug, views: 0, lastViewed: new Date().toISOString(), sessionViewed: false };
  }
  viewData[slug].views += 1;
  viewData[slug].lastViewed = new Date().toISOString();
  viewData[slug].sessionViewed = true;
  saveViewData(viewData);

  // Fire-and-forget server sync; update local with authoritative count if available
  tryServerPost(slug).then((serverCount) => {
    if (serverCount === null) return;
    const vd = getViewData();
    if (!vd[slug]) return;
    vd[slug].views = serverCount;
    saveViewData(vd);
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY } as any));
    } catch {}
  });

  return viewData[slug].views;
}

// Get view count for a post
export function getViewCount(slug: string): number {
  const viewData = getViewData();
  const local = viewData[slug]?.views || 0;
  // Refresh from server in background
  tryServerGet(slug).then((serverCount) => {
    if (serverCount === null) return;
    const vd = getViewData();
    if (!vd[slug]) {
      vd[slug] = { slug, views: serverCount, lastViewed: new Date().toISOString(), sessionViewed: false };
    } else {
      vd[slug].views = serverCount;
    }
    saveViewData(vd);
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY } as any));
    } catch {}
  });
  return local;
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
  // Kick off server fetch in background to update local cache
  (async () => {
    try {
      const res = await fetch(`/api/views/popular?limit=${limit}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const popular: Array<{ slug: string; views: number }> = data.popular || []
      // Merge into local view data
      const vd = getViewData()
      popular.forEach(({ slug, views }) => {
        if (!vd[slug]) {
          vd[slug] = { slug, views, lastViewed: new Date().toISOString(), sessionViewed: false }
        } else {
          vd[slug].views = views
        }
      })
      saveViewData(vd)
      try { window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY } as any)); } catch {}
    } catch {}
  })()

  return Object.values(viewData)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map(data => ({ slug: data.slug, views: data.views }));
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
