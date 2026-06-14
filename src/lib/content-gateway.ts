import type { Post, Project } from '@/lib/content'
import { dbGetAllPosts, dbGetAllProjects, dbGetPost, dbGetProject } from '@/lib/repos/db-content'
import * as fsContent from '@/lib/content'

const USE_DB = (process.env.CONTENT_BACKEND || '').toLowerCase() === 'db'

export async function getAllPosts(): Promise<Post[]> {
  if (USE_DB) return dbGetAllPosts()
  return fsContent.getAllPosts()
}

export async function getAllProjects(): Promise<Project[]> {
  if (USE_DB) return dbGetAllProjects()
  return fsContent.getAllProjects()
}

export async function getPost(slug: string): Promise<Post | null> {
  if (USE_DB) return dbGetPost(slug)
  return fsContent.getPost(slug)
}

export async function getProject(slug: string): Promise<Project | null> {
  if (USE_DB) return dbGetProject(slug)
  return fsContent.getProject(slug)
}

export async function getStandalonePosts(): Promise<Post[]> {
  const all = await getAllPosts()
  return all.filter((p) => !p.meta.project)
}
