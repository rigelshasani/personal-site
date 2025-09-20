// src/app/api/health/db/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db' // <- reuse singleton

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    // Lightweight liveness + one sample read
    await prisma.$queryRaw`SELECT 1`
    const [post] = await prisma.post.findMany({ take: 1, select: { slug: true } })
    return NextResponse.json({ ok: true, sample: post?.slug ?? null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function HEAD() {
  try { await prisma.$queryRaw`SELECT 1`; return new Response(null, { status: 204 }) }
  catch { return new Response(null, { status: 500 }) }
}
