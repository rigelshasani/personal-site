import { prisma } from '@/lib/db'

export async function getViewCountDb(slug: string): Promise<number> {
  const rec = await prisma.viewCount.findUnique({ where: { slug } })
  return rec?.count || 0
}

export async function incrementViewCountDb(slug: string): Promise<number> {
  const updated = await prisma.viewCount.upsert({
    where: { slug },
    update: { count: { increment: 1 } },
    create: { slug, count: 1 },
  })
  return updated.count
}

export async function getPopularPostsDb(limit = 5): Promise<Array<{ slug: string; views: number }>> {
  const rows = await prisma.viewCount.findMany({
    orderBy: { count: 'desc' },
    take: limit,
  })
  return rows.map((r) => ({ slug: r.slug, views: r.count }))
}

