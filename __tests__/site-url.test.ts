/**
 * This used to fall back to a hardcoded domain that the project did not own,
 * which meant an unset env var published canonical URLs pointing at a stranger's
 * site. Guard every branch.
 */
describe('getSiteUrl', () => {
  const saved = { ...process.env }

  afterEach(() => {
    process.env = { ...saved }
    jest.resetModules()
  })

  function load(env: Record<string, string | undefined>) {
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
    jest.resetModules()
    return require('@/lib/site-url').getSiteUrl()
  }

  it('prefers an explicit NEXT_PUBLIC_SITE_URL', () => {
    expect(
      load({ NEXT_PUBLIC_SITE_URL: 'https://example.com', VERCEL_PROJECT_PRODUCTION_URL: 'ignored.vercel.app' })
    ).toBe('https://example.com')
  })

  it('strips trailing slashes so joined paths do not double up', () => {
    expect(load({ NEXT_PUBLIC_SITE_URL: 'https://example.com//' })).toBe('https://example.com')
  })

  it("falls back to Vercel's production hostname", () => {
    expect(
      load({ NEXT_PUBLIC_SITE_URL: undefined, VERCEL_PROJECT_PRODUCTION_URL: 'my-site.vercel.app' })
    ).toBe('https://my-site.vercel.app')
  })

  it('falls back to localhost, never to a hardcoded public domain', () => {
    const url = load({ NEXT_PUBLIC_SITE_URL: undefined, VERCEL_PROJECT_PRODUCTION_URL: undefined })
    expect(url).toBe('http://localhost:3000')
    expect(url).not.toContain('rigels.dev')
  })

  it('ignores a blank NEXT_PUBLIC_SITE_URL', () => {
    expect(
      load({ NEXT_PUBLIC_SITE_URL: '   ', VERCEL_PROJECT_PRODUCTION_URL: 'my-site.vercel.app' })
    ).toBe('https://my-site.vercel.app')
  })
})
