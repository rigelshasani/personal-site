import { prisma } from '@/lib/db'
import type { Post, Project, PostMeta, ProjectMeta } from '@/lib/content'

function calculateReadingTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 225))
  return `${minutes} min`
}

export async function dbGetAllPosts(): Promise<Post[]> {
  const records = await prisma.post.findMany({ orderBy: { date: 'desc' } })
  return records.map((r) => ({
    slug: r.slug,
    meta: {
      title: r.title,
      description: r.description,
      date: r.date.toISOString().split('T')[0],
      tags: r.tagsJson ? (JSON.parse(r.tagsJson) as string[]) : undefined,
      project: r.projectSlug || undefined,
      order: r.order || undefined,
      images: r.imagesJson ? (JSON.parse(r.imagesJson) as string[]) : undefined,
    } satisfies PostMeta,
    content: r.content,
    readingTime: r.readingTime || calculateReadingTime(r.content),
  }))
}

export async function dbGetPost(slug: string): Promise<Post | null> {
  const r = await prisma.post.findUnique({ where: { slug } })
  if (!r) return null
  return {
    slug: r.slug,
    meta: {
      title: r.title,
      description: r.description,
      date: r.date.toISOString().split('T')[0],
      tags: r.tagsJson ? (JSON.parse(r.tagsJson) as string[]) : undefined,
      project: r.projectSlug || undefined,
      order: r.order || undefined,
      images: r.imagesJson ? (JSON.parse(r.imagesJson) as string[]) : undefined,
    },
    content: r.content,
    readingTime: r.readingTime || calculateReadingTime(r.content),
  }
}

export async function dbGetAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({ orderBy: { date: 'desc' } })
  const posts = await prisma.post.findMany({})
  const postsBySlug = new Map<string, Post[]>(
    projects.map((p) => [p.slug, []])
  )
  posts.forEach((r) => {
    if (!r.projectSlug) return
    const list = postsBySlug.get(r.projectSlug)
    const post: Post = {
      slug: r.slug,
      meta: {
        title: r.title,
        description: r.description,
        date: r.date.toISOString().split('T')[0],
        tags: r.tagsJson ? (JSON.parse(r.tagsJson) as string[]) : undefined,
        project: r.projectSlug || undefined,
        order: r.order || undefined,
        images: r.imagesJson ? (JSON.parse(r.imagesJson) as string[]) : undefined,
      },
      content: r.content,
      readingTime: r.readingTime || calculateReadingTime(r.content),
    }
    list?.push(post)
  })
  // Keep order within project
  projects.forEach((p) => {
    const arr = postsBySlug.get(p.slug)
    arr?.sort((a, b) => (a.meta.order || 0) - (b.meta.order || 0))
  })
  return projects.map((p) => ({
    slug: p.slug,
    meta: {
      title: p.title,
      description: p.description,
      date: p.date.toISOString().split('T')[0],
      status: p.status as ProjectMeta['status'],
      tech: p.techJson ? (JSON.parse(p.techJson) as string[]) : undefined,
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
      tech: p.techJson ? (JSON.parse(p.techJson) as string[]) : undefined,
      github: p.github || undefined,
      demo: p.demo || undefined,
      featured: p.featured,
    },
    content: p.content,
    posts: posts.map((r) => ({
      slug: r.slug,
      meta: {
        title: r.title,
        description: r.description,
        date: r.date.toISOString().split('T')[0],
        tags: r.tagsJson ? (JSON.parse(r.tagsJson) as string[]) : undefined,
        project: r.projectSlug || undefined,
        order: r.order || undefined,
        images: r.imagesJson ? (JSON.parse(r.imagesJson) as string[]) : undefined,
      },
      content: r.content,
      readingTime: r.readingTime || calculateReadingTime(r.content),
    })),
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
      tagsJson: meta.tags ? JSON.stringify(meta.tags) : null,
      projectSlug: meta.project || null,
      order: typeof meta.order === 'number' ? meta.order : null,
      imagesJson: meta.images ? JSON.stringify(meta.images) : null,
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
      tagsJson: meta.tags ? JSON.stringify(meta.tags) : null,
      projectSlug: meta.project || null,
      order: typeof meta.order === 'number' ? meta.order : null,
      imagesJson: meta.images ? JSON.stringify(meta.images) : null,
      content,
    },
  })
}

export async function dbDeletePost(slug: string) {
  const exists = await prisma.post.findUnique({ where: { slug } })
  if (!exists) throw new Error('Post not found')
  await prisma.post.delete({ where: { slug } })
}

