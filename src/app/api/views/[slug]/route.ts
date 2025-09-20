import { NextRequest, NextResponse } from 'next/server'
import { getViewCountDb, incrementViewCountDb } from '@/lib/repos/views-repo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const NO_STORE: HeadersInit = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
}

type Params = { slug: string }

// GET /api/views/[slug]  → read-only
export async function GET(_req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  try {
    const count = await getViewCountDb(slug)
    return NextResponse.json({ success: true, slug, count }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch view count' }, { status: 500, headers: NO_STORE })
  }
}

// POST /api/views/[slug] → increment
export async function POST(_req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  try {
    const count = await incrementViewCountDb(slug)
    return NextResponse.json({ success: true, slug, count }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500, headers: NO_STORE })
  }
}
