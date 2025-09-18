import { NextRequest, NextResponse } from 'next/server'
import { getViewCountDb, incrementViewCountDb } from '@/lib/repos/views-repo'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const count = await getViewCountDb(params.slug)
    return NextResponse.json({ success: true, slug: params.slug, count })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch view count' }, { status: 500 })
  }
}

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const count = await incrementViewCountDb(params.slug)
    return NextResponse.json({ success: true, slug: params.slug, count })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 })
  }
}

