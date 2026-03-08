import { NextRequest, NextResponse } from 'next/server'
import { getPopularPostsDb } from '@/lib/repos/views-repo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const NO_STORE: HeadersInit = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const raw = searchParams.get('limit') ?? '5'
    const parsed = parseInt(raw, 10)
    const limit = isNaN(parsed) ? 5 : Math.max(1, Math.min(50, parsed))
    const popular = await getPopularPostsDb(limit)
    return NextResponse.json({ success: true, popular }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch popular posts' }, { status: 500, headers: NO_STORE })
  }
}
