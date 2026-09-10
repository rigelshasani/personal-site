/**
 * Absolute origin of this deployment, used by the sitemap, robots.txt and
 * OpenGraph metadata.
 *
 * Deliberately has no hardcoded domain fallback: a stale one does not fail
 * loudly, it silently publishes canonical URLs pointing at somebody else's
 * site. Vercel's own production hostname is the fallback instead.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')

  // Injected by Vercel at build and runtime, without a protocol.
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelHost) return `https://${vercelHost}`

  return 'http://localhost:3000'
}
