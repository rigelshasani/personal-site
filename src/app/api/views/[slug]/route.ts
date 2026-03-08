import { NextRequest, NextResponse } from 'next/server'
import { getViewCountDb, incrementViewCountDb } from '@/lib/repos/views-repo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const NO_STORE: HeadersInit = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
}

const SLUG_RE = /^[a-z0-9-]+$/
const RATE_LIMIT_MS = 60_000
const rateLimitMap = new Map<string, number>()

function isRateLimited(ip: string, slug: string): boolean {
  const key = `${ip}:${slug}`
  const last = rateLimitMap.get(key)
  const now = Date.now()
  if (last && now - last < RATE_LIMIT_MS) return true
  rateLimitMap.set(key, now)
  // Prune stale entries to avoid unbounded memory growth
  if (rateLimitMap.size > 10_000) {
    const cutoff = now - RATE_LIMIT_MS
    for (const [k, v] of rateLimitMap) {
      if (v < cutoff) rateLimitMap.delete(k)
    }
  }
  return false
}

type Params = { slug: string }

// GET /api/views/[slug]  → read-only
export async function GET(_req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400, headers: NO_STORE })
  }
  try {
    const count = await getViewCountDb(slug)
    return NextResponse.json({ success: true, slug, count }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch view count' }, { status: 500, headers: NO_STORE })
  }
}

// POST /api/views/[slug] → increment
export async function POST(req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400, headers: NO_STORE })
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip, slug)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: NO_STORE })
  }
  try {
    const count = await incrementViewCountDb(slug)
    return NextResponse.json({ success: true, slug, count }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500, headers: NO_STORE })
  }
}
