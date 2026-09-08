/**
 * The filesystem backend writes MDX files to disk, which no serverless host
 * persists, so forgetting CONTENT_BACKEND in production used to make every
 * admin save fail. The db backend is the default; guard that here.
 */
describe('content backend selection', () => {
  const original = process.env.CONTENT_BACKEND

  afterEach(() => {
    process.env.CONTENT_BACKEND = original
    jest.resetModules()
  })

  function loadShouldUseDb(value: string | undefined) {
    if (value === undefined) {
      delete process.env.CONTENT_BACKEND
    } else {
      process.env.CONTENT_BACKEND = value
    }
    jest.resetModules()
    return require('@/lib/content-service').shouldUseDb()
  }

  it('defaults to the db backend when CONTENT_BACKEND is unset', () => {
    expect(loadShouldUseDb(undefined)).toBe(true)
  })

  it('defaults to the db backend when CONTENT_BACKEND is empty', () => {
    expect(loadShouldUseDb('')).toBe(true)
  })

  it('uses the db backend when explicitly set', () => {
    expect(loadShouldUseDb('db')).toBe(true)
    expect(loadShouldUseDb('DB')).toBe(true)
  })

  it('opts out of the db backend only for CONTENT_BACKEND=fs', () => {
    expect(loadShouldUseDb('fs')).toBe(false)
  })
})
