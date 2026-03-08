import { NextRequest, NextResponse } from 'next/server'
import { getCommentsDb, createCommentDb } from '@/lib/repos/comments-repo'

const SLUG_RE = /^[a-z0-9-]+$/

type Params = { slug: string }

export async function GET(_req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }
  try {
    const comments = await getCommentsDb(slug)
    return NextResponse.json({ success: true, comments })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }
  try {
    const body = await req.json()
    const { username, content } = body as { username?: string; content?: string }
    if (!username?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Missing username or content' }, { status: 400 })
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment too long' }, { status: 400 })
    }
    const comment = await createCommentDb(
      slug,
      username.trim().slice(0, 50),
      content.trim()
    )
    return NextResponse.json({ success: true, comment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
