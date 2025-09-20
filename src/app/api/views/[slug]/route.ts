// src/app/api/views/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getViewCountDb, incrementViewCountDb } from '@/lib/repos/views-repo'

type Params = { slug: string }

// GET /api/views/[slug]
export async function GET(_req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  try {
    const count = await getViewCountDb(slug)
    return NextResponse.json({ success: true, slug, count })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch view count' }, { status: 500 })
  }
}

// POST /api/views/[slug]
export async function POST(_req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  try {
    const count = await incrementViewCountDb(slug)
    return NextResponse.json({ success: true, slug, count })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 })
  }
}
