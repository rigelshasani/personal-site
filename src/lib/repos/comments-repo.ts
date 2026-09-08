import { prisma } from '@/lib/db'

export interface CommentRecord {
  id: string
  username: string
  content: string
  timestamp: string
}

export async function getCommentsDb(slug: string): Promise<CommentRecord[]> {
  const rows = await prisma.comment.findMany({
    where: { slug },
    orderBy: { timestamp: 'asc' },
    select: { id: true, username: true, content: true, timestamp: true },
  })
  return rows.map((r) => ({
    id: String(r.id),
    username: r.username,
    content: r.content,
    timestamp: r.timestamp.toISOString(),
  }))
}

export async function createCommentDb(
  slug: string,
  username: string,
  content: string
): Promise<CommentRecord> {
  const row = await prisma.comment.create({
    data: { slug, username, content },
    select: { id: true, username: true, content: true, timestamp: true },
  })
  return {
    id: String(row.id),
    username: row.username,
    content: row.content,
    timestamp: row.timestamp.toISOString(),
  }
}

export async function countRecentCommentsDb(
  slug: string,
  since: Date
): Promise<number> {
  return prisma.comment.count({
    where: { slug, timestamp: { gte: since } },
  })
}

export async function deleteCommentDb(id: number): Promise<boolean> {
  const { count } = await prisma.comment.deleteMany({ where: { id } })
  return count > 0
}
