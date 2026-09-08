import { revalidatePath } from 'next/cache'

/**
 * The public site is statically rendered, so a post written in the admin editor
 * lands in the database but stays invisible until the paths that list or render
 * it are revalidated. Every admin write goes through here.
 */
export function revalidatePostPaths(slug?: string) {
  revalidatePath('/')
  revalidatePath('/posts')
  revalidatePath('/sitemap.xml')
  if (slug) revalidatePath(`/posts/${slug}`)

  // A post can be attached to, moved between, or detached from a project, and
  // the previous project isn't known here, so refresh every project page.
  revalidatePath('/projects')
  revalidatePath('/projects/[slug]', 'page')
}
