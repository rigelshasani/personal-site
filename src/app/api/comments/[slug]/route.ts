import { NextRequest, NextResponse } from 'next/server'
import { getCommentsDb, createCommentDb } from '@/lib/repos/comments-repo'

const SLUG_RE = /^[a-z0-9-]+$/

// Allow 3 comments per IP per 10-minute window.
// In-process only — sufficient for a personal blog on a single serverless instance.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 3
const ipWindows = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (ipWindows.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_PER_WINDOW) return true
  ipWindows.set(ip, [...timestamps, now])
  return false
}

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

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many comments. Please wait before posting again.' },
      { status: 429 }
    )
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
