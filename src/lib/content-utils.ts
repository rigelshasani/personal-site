import type { Post } from "@/lib/content";

// Extract first image URL from a post (frontmatter images, markdown image, or Figure src)
export function getFirstImageUrl(post: Post): string | null {
  if (post.meta.images && post.meta.images.length > 0) {
    return post.meta.images[0];
  }
  const mdImage = post.content.match(/!\[.*?\]\((.*?)\)/);
  if (mdImage?.[1]) return mdImage[1].trim();

  const figureImage = post.content.match(/<Figure[^>]+src=\"([^\"]+)\"/);
  if (figureImage?.[1]) return figureImage[1].trim();

  return null;
}

export function isValidImageUrl(url: string): boolean {
  return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

