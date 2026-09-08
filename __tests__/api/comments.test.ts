import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/comments/[slug]/route'

jest.mock('@/lib/repos/comments-repo')
import {
  getCommentsDb,
  createCommentDb,
  countRecentCommentsDb,
} from '@/lib/repos/comments-repo'
const mockGetComments = getCommentsDb as jest.MockedFunction<typeof getCommentsDb>
const mockCreateComment = createCommentDb as jest.MockedFunction<typeof createCommentDb>
const mockCountRecent = countRecentCommentsDb as jest.MockedFunction<
  typeof countRecentCommentsDb
>

beforeEach(() => {
  jest.clearAllMocks()
  // Default to an uncontended slug; the rate-limit suite overrides this.
  mockCountRecent.mockResolvedValue(0)
})

let ipCounter = 0
const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/comments/test-slug`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      // Unique IP per request so tests don't share rate-limit buckets
      'x-forwarded-for': `10.0.0.${++ipCounter}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

const makeCtx = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe('GET /api/comments/[slug]', () => {
  it('returns comments for a valid slug', async () => {
    const comments = [
      { id: '1', username: 'User1', content: 'Hello', timestamp: '2024-01-01T00:00:00.000Z' },
    ]
    mockGetComments.mockResolvedValue(comments)

    const res = await GET(makeRequest('GET'), makeCtx('test-slug'))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.comments).toEqual(comments)
  })

  it('returns 400 for an invalid slug', async () => {
    const res = await GET(makeRequest('GET'), makeCtx('../evil'))
    expect(res.status).toBe(400)
  })

  it('returns 500 when the DB throws', async () => {
    mockGetComments.mockRejectedValue(new Error('DB error'))

    const res = await GET(makeRequest('GET'), makeCtx('test-slug'))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/comments/[slug]', () => {
  it('creates a comment and returns 201', async () => {
    const comment = {
      id: '1',
      username: 'AnonymousReader1',
      content: 'Great post!',
      timestamp: '2024-01-01T00:00:00.000Z',
    }
    mockCreateComment.mockResolvedValue(comment)

    const res = await POST(
      makeRequest('POST', { username: 'AnonymousReader1', content: 'Great post!' }),
      makeCtx('test-slug')
    )
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.comment).toEqual(comment)
  })

  it('returns 400 for an invalid slug', async () => {
    const res = await POST(
      makeRequest('POST', { username: 'User', content: 'Hi' }),
      makeCtx('../evil')
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when username is missing', async () => {
    const res = await POST(
      makeRequest('POST', { content: 'No username here' }),
      makeCtx('test-slug')
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when content is missing', async () => {
    const res = await POST(
      makeRequest('POST', { username: 'User1' }),
      makeCtx('test-slug')
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when content exceeds 1000 characters', async () => {
    const res = await POST(
      makeRequest('POST', { username: 'User1', content: 'x'.repeat(1001) }),
      makeCtx('test-slug')
    )
    expect(res.status).toBe(400)
  })

  it('returns 500 when the DB throws', async () => {
    mockCreateComment.mockRejectedValue(new Error('DB error'))

    const res = await POST(
      makeRequest('POST', { username: 'User1', content: 'Hello' }),
      makeCtx('test-slug')
    )
    expect(res.status).toBe(500)
  })

  it('returns 429 when the same IP exceeds 3 comments per window', async () => {
    const fixedIp = '192.0.2.1'
    const makeFixedIpRequest = (body: object) =>
      new NextRequest('http://localhost/api/comments/test-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': fixedIp },
        body: JSON.stringify(body),
      })

    mockCreateComment.mockResolvedValue({
      id: '1', username: 'User', content: 'Hi', timestamp: new Date().toISOString(),
    })

    const payload = { username: 'User', content: 'Hi' }
    await POST(makeFixedIpRequest(payload), makeCtx('test-slug'))
    await POST(makeFixedIpRequest(payload), makeCtx('test-slug'))
    await POST(makeFixedIpRequest(payload), makeCtx('test-slug'))

    const res = await POST(makeFixedIpRequest(payload), makeCtx('test-slug'))
    expect(res.status).toBe(429)
  })
})

describe('POST /api/comments/[slug] per-slug rate limit', () => {
  it('rejects once the slug has hit its window ceiling', async () => {
    // The in-process per-IP counter resets on every serverless cold start, so
    // this database-backed check is what actually bounds a sustained flood.
    mockCountRecent.mockResolvedValue(15)

    const res = await POST(
      makeRequest('POST', { username: 'Someone', content: 'Hello' }),
      makeCtx('test-slug')
    )

    expect(res.status).toBe(429)
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('allows a comment while the slug is below the ceiling', async () => {
    mockCountRecent.mockResolvedValue(14)
    mockCreateComment.mockResolvedValue({
      id: '1',
      username: 'Someone',
      content: 'Hello',
      timestamp: '2024-01-01T00:00:00.000Z',
    })

    const res = await POST(
      makeRequest('POST', { username: 'Someone', content: 'Hello' }),
      makeCtx('test-slug')
    )

    expect(res.status).toBe(201)
    expect(mockCountRecent).toHaveBeenCalledWith('test-slug', expect.any(Date))
  })
})
