import { NextRequest, NextResponse } from 'next/server'
import { getPopularPostsDb } from '@/lib/repos/views-repo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.max(1, Math.min(50, parseInt(limitParam, 10) || 5)) : 5
    const popular = await getPopularPostsDb(limit)
    return NextResponse.json({ success: true, popular })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch popular posts' }, { status: 500 })
  }
}

