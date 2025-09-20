import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const NO_STORE: HeadersInit = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const [post] = await prisma.post.findMany({ take: 1, select: { slug: true } })
    const version =
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_COMMIT_SHA ?? 'dev'
    return NextResponse.json(
      { ok: true, version, sample: post?.slug ?? null },
      { headers: NO_STORE }
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500, headers: NO_STORE })
  }
}

export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new Response(null, { status: 204, headers: NO_STORE })
  } catch {
    return new Response(null, { status: 500, headers: NO_STORE })
  }
}
