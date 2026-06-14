import type { PostMeta } from "@/lib/content";

export function extractFirstImageUrl(meta: PostMeta, content: string): string | undefined {
  if (meta.images && meta.images.length > 0) return meta.images[0];
  const md = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (md?.[1]) return md[1].trim();
  const fig = content.match(/<Figure[^>]+src=(?:"([^"]+)"|'([^']+)')/);
  if (fig?.[1] || fig?.[2]) return (fig[1] || fig[2])!.trim();
  const img = content.match(/<img[^>]+src=(?:"([^"]+)"|'([^']+)')/i);
  if (img?.[1] || img?.[2]) return (img[1] || img[2])!.trim();
  return undefined;
}

export function isValidImageUrl(url: string): boolean {
  return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

