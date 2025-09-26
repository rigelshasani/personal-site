// src/lib/view-counter.ts — Anonymous view counting with server sync (debounced)
// 'use client' stays because this file uses local/session storage
'use client'

interface ViewData {
  slug: string
  views: number
  lastViewed: string
  sessionViewed: boolean
}

const STORAGE_KEY = 'blog-view-counts'
const SESSION_KEY = 'current-session-views'

// In-flight + cached GETs (per slug)
const viewCountCache = new Map<
  string,
  { ts: number; promise: Promise<number> }
>()

// Cached /popular result
let popularCache:
  | { ts: number; limit: number; promise: Promise<Array<{ slug: string; views: number }>> }
  | null = null

// --- local storage helpers ----------------------------------------------------

function getViewData(): Record<string, ViewData> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveViewData(data: Record<string, ViewData>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
  // notify listeners (best-effort)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY } as any))
  } catch {}
}

// --- network helpers ----------------------------------------------------------

async function serverGet(slug: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/views/${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.count === 'number' ? data.count : null
  } catch {
    return null
  }
}

function serverPostOnce(slug: string) {
  if (typeof window === 'undefined') return
  const key = `viewed:${slug}`
  try {
    if (sessionStorage.getItem(key)) return
  } catch {
    // ignore session storage read errors
  }
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    // ignore session storage write errors (e.g., quota exceeded)
  }
  // fire-and-forget (only if fetch is available)
  try {
    if (typeof (globalThis as unknown as { fetch?: unknown }).fetch === 'function') {
      void fetch(`/api/views/${encodeURIComponent(slug)}`, { method: 'POST' }).catch(() => {})
    }
  } catch {
    // ignore network unavailability in non-browser environments/tests
  }
}

// --- public API ---------------------------------------------------------------

// Record a view for a post (optimistic local, single POST per session)
export function recordView(slug: string): number {
  if (typeof window === 'undefined') return 0

  const data = getViewData()
  const nowIso = new Date().toISOString()
  if (!data[slug]) {
    data[slug] = { slug, views: 0, lastViewed: nowIso, sessionViewed: false }
  }
  data[slug].views += 1
  data[slug].lastViewed = nowIso
  data[slug].sessionViewed = true
  saveViewData(data)

  // single POST per browser session
  serverPostOnce(slug)
  return data[slug].views
}

// Get view count for a post with de-duped background refresh.
// TTL prevents hammering during dev re-renders.
export function getViewCount(slug: string, ttlMs = 60_000): number {
  const data = getViewData()
  const local = data[slug]?.views ?? 0

  const now = Date.now()
  const cached = viewCountCache.get(slug)
  const fresh = cached && now - cached.ts < ttlMs

  if (!fresh) {
    const promise = (async () => {
      const serverCount = await serverGet(slug)
      if (serverCount == null) return local
      const latest = getViewData()
      if (!latest[slug]) {
        latest[slug] = { slug, views: serverCount, lastViewed: new Date().toISOString(), sessionViewed: false }
      } else {
        latest[slug].views = serverCount
        latest[slug].lastViewed = new Date().toISOString()
      }
      saveViewData(latest)
      return serverCount
    })()
    viewCountCache.set(slug, { ts: now, promise })
    // no await; returns local immediately
  }

  return local
}

// Get all local view counts (no network)
export function getAllViewCounts(): Record<string, number> {
  const data = getViewData()
  const out: Record<string, number> = {}
  for (const v of Object.values(data)) out[v.slug] = v.views
  return out
}

// Popular posts with memoized server refresh (TTL)
export function getPopularPosts(limit = 5, ttlMs = 60_000): Array<{ slug: string; views: number }> {
  const data = getViewData()

  const now = Date.now()
  const reuse =
    popularCache &&
    popularCache.limit === limit &&
    now - popularCache.ts < ttlMs

  if (!reuse) {
    popularCache = {
      ts: now,
      limit,
      promise: (async () => {
        try {
          const res = await fetch(`/api/views/popular?limit=${limit}`, { cache: 'no-store' })
          if (!res.ok) return [] as Array<{ slug: string; views: number }>
          const json = await res.json()
          const popular: Array<{ slug: string; views: number }> = json.popular || []
          const latest = getViewData()
          const stamp = new Date().toISOString()
          for (const { slug, views } of popular) {
            if (!latest[slug]) {
              latest[slug] = { slug, views, lastViewed: stamp, sessionViewed: false }
            } else {
              latest[slug].views = views
              latest[slug].lastViewed = stamp
            }
          }
          saveViewData(latest)
          return popular
        } catch {
          return [] as Array<{ slug: string; views: number }>
        }
      })(),
    }
  } else {
    // fire-and-forget: keep the promise chain alive to update local store when it resolves
    void popularCache!.promise
  }

  // return current local top-N immediately
  return Object.values(data)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map(({ slug, views }) => ({ slug, views }))
}

// Format for UI
export function formatViewCount(count: number): string {
  if (count === 0) return '0 views'
  if (count === 1) return '1 view'
  if (count < 1_000) return `${count} views`
  if (count < 1_000_000) return `${(count / 1_000).toFixed(1)}k views`
  return `${(count / 1_000_000).toFixed(1)}M views`
}

// Maintenance
export function clearAllViews() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function exportViewData(): string {
  return JSON.stringify(getViewData(), null, 2)
}
