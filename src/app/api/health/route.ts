// app/api/health/db/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() {
  try {
    const [post] = await prisma.post.findMany({ take: 1, select: { slug: true } });
    return NextResponse.json({ ok: true, sample: post?.slug ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
