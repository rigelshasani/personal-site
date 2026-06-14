import { prisma } from '@/lib/db'
import type { Post, Project, PostMeta, ProjectMeta } from '@/lib/content'
import { extractFirstImageUrl } from '@/lib/content-utils'

function calculateReadingTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 225))
  return `${minutes} min`
}

function mapPostRecord(r: {
  slug: string
  title: string
  description: string
  date: Date
  readingTime: string
  tags: unknown
  order: number | null
  images: unknown
  featured: boolean
  content: string
  projectSlug: string | null
}): Post {
  const meta: PostMeta = {
    title: r.title,
    description: r.description,
    date: r.date.toISOString().split('T')[0],
    tags: r.tags as string[] | undefined,
    project: r.projectSlug || undefined,
    order: r.order || undefined,
    images: r.images as string[] | undefined,
    featured: r.featured || undefined,
  }
  return {
    slug: r.slug,
    meta,
    content: r.content,
    readingTime: r.readingTime || calculateReadingTime(r.content),
    firstImageUrl: extractFirstImageUrl(meta, r.content),
  }
}

export async function dbGetAllPosts(): Promise<Post[]> {
  const records = await prisma.post.findMany({ orderBy: { date: 'desc' } })
  return records.map(mapPostRecord)
}

export async function dbGetPost(slug: string): Promise<Post | null> {
  const r = await prisma.post.findUnique({ where: { slug } })
  return r ? mapPostRecord(r) : null
}

export async function dbGetAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({ orderBy: { date: 'desc' } })
  const posts = await prisma.post.findMany({ orderBy: { date: 'desc' } })

  const postsBySlug = new Map<string, Post[]>(projects.map((p) => [p.slug, []]))
  posts.forEach((r) => {
    if (!r.projectSlug) return
    postsBySlug.get(r.projectSlug)?.push(mapPostRecord(r))
  })
  projects.forEach((p) => {
    postsBySlug.get(p.slug)?.sort((a, b) => (a.meta.order || 0) - (b.meta.order || 0))
  })

  return projects.map((p) => ({
    slug: p.slug,
    meta: {
      title: p.title,
      description: p.description,
      date: p.date.toISOString().split('T')[0],
      status: p.status as ProjectMeta['status'],
      tech: p.tech as string[] | undefined,
      github: p.github || undefined,
      demo: p.demo || undefined,
      featured: p.featured,
    } satisfies ProjectMeta,
    content: p.content,
    posts: postsBySlug.get(p.slug) || [],
  }))
}

export async function dbGetProject(slug: string): Promise<Project | null> {
  const p = await prisma.project.findUnique({ where: { slug } })
  if (!p) return null
  const posts = await prisma.post.findMany({ where: { projectSlug: slug }, orderBy: { order: 'asc' } })
  return {
    slug: p.slug,
    meta: {
      title: p.title,
      description: p.description,
      date: p.date.toISOString().split('T')[0],
      status: p.status as ProjectMeta['status'],
      tech: p.tech as string[] | undefined,
      github: p.github || undefined,
      demo: p.demo || undefined,
      featured: p.featured,
    },
    content: p.content,
    posts: posts.map(mapPostRecord),
  }
}

export async function dbCreatePost(slug: string, meta: PostMeta, content: string) {
  await prisma.post.create({
    data: {
      slug,
      title: meta.title,
      description: meta.description,
      date: new Date(meta.date),
      readingTime: calculateReadingTime(content),
      tags: meta.tags ?? null,
      projectSlug: meta.project || null,
      order: typeof meta.order === 'number' ? meta.order : null,
      images: meta.images ?? null,
      featured: meta.featured ?? false,
      content,
    },
  })
}

export async function dbUpdatePost(slug: string, meta: PostMeta, content: string) {
  const exists = await prisma.post.findUnique({ where: { slug } })
  if (!exists) throw new Error('Post not found')
  await prisma.post.update({
    where: { slug },
    data: {
      title: meta.title,
      description: meta.description,
      date: new Date(meta.date),
      readingTime: calculateReadingTime(content),
      tags: meta.tags ?? null,
      projectSlug: meta.project || null,
      order: typeof meta.order === 'number' ? meta.order : null,
      images: meta.images ?? null,
      featured: meta.featured ?? false,
      content,
    },
  })
}

export async function dbDeletePost(slug: string) {
  const exists = await prisma.post.findUnique({ where: { slug } })
  if (!exists) throw new Error('Post not found')
  await prisma.post.delete({ where: { slug } })
}
