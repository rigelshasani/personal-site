import { NextRequest, NextResponse } from 'next/server'
import { getViewCountDb, incrementViewCountDb } from '@/lib/repos/views-repo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const NO_STORE: HeadersInit = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
}

const SLUG_RE = /^[a-z0-9-]+$/

type Params = { slug: string }

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

// Dedup is enforced client-side via sessionStorage (view-counter.ts:serverPostOnce).
// An in-process Map would not work across serverless function instances anyway.
export async function POST(_req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400, headers: NO_STORE })
  }
  try {
    const count = await incrementViewCountDb(slug)
    return NextResponse.json({ success: true, slug, count }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500, headers: NO_STORE })
  }
}
