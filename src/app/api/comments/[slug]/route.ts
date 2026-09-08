import { NextRequest, NextResponse } from 'next/server'
import {
  getCommentsDb,
  createCommentDb,
  countRecentCommentsDb,
} from '@/lib/repos/comments-repo'

const SLUG_RE = /^[a-z0-9-]+$/

// Two layers, because neither is sufficient alone:
//   - per-IP, in-process: cheap and precise, but every serverless cold start
//     hands the next request an empty map, so it cannot bound a sustained flood.
//   - per-slug, in the database: survives cold starts and instance fan-out, at
//     the cost of being coarse — a burst of legitimate discussion on one post
//     can hit it, so the ceiling is set well above the per-IP allowance.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 3
const MAX_PER_SLUG_PER_WINDOW = 15
const ipWindows = new Map<string, number[]>()
let lastCleanup = Date.now()

// Sweep stale IPs at most once per window instead of on every request,
// so the map doesn't grow unbounded without needing a background timer.
function cleanupStaleEntries(now: number) {
  if (now - lastCleanup < WINDOW_MS) return
  lastCleanup = now
  for (const [ip, timestamps] of ipWindows) {
    if (timestamps.every((t) => now - t >= WINDOW_MS)) {
      ipWindows.delete(ip)
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  cleanupStaleEntries(now)
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
    const recent = await countRecentCommentsDb(slug, new Date(Date.now() - WINDOW_MS))
    if (recent >= MAX_PER_SLUG_PER_WINDOW) {
      return NextResponse.json(
        { error: 'This post is getting a lot of comments. Please try again shortly.' },
        { status: 429 }
      )
    }
  } catch {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
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
