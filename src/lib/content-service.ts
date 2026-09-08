import type { PostMeta } from '@/lib/content'
import { generateSlug } from '@/lib/post-utils'
import { dbCreatePost, dbUpdatePost, dbDeletePost } from '@/lib/repos/db-content'

// Database-backed content is the production default: the filesystem backend
// writes MDX files to disk, which no serverless host persists. Opt out with
// CONTENT_BACKEND=fs for local work against src/content.
const USE_DB = (process.env.CONTENT_BACKEND || 'db').toLowerCase() === 'db'

export function shouldUseDb() {
  return USE_DB
}

export async function createPost(meta: PostMeta, content: string): Promise<{ slug: string }>
export async function createPost(meta: PostMeta, content: string) {
  const slug = generateSlug(meta.title)
  if (USE_DB) {
    await dbCreatePost(slug, meta, content)
    return { slug }
  } else {
    // Defer to filesystem utils via existing API routes
    throw new Error('Content writes require the db backend (unset CONTENT_BACKEND=fs)')
  }
}

export async function updatePost(slug: string, meta: PostMeta, content: string) {
  if (USE_DB) {
    await dbUpdatePost(slug, meta, content)
  } else {
    throw new Error('Content writes require the db backend (unset CONTENT_BACKEND=fs)')
  }
}

export async function deletePost(slug: string) {
  if (USE_DB) {
    await dbDeletePost(slug)
  } else {
    throw new Error('Content writes require the db backend (unset CONTENT_BACKEND=fs)')
  }
}

