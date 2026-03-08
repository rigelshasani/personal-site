import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/comments/[slug]/route'

jest.mock('@/lib/repos/comments-repo')
import { getCommentsDb, createCommentDb } from '@/lib/repos/comments-repo'
const mockGetComments = getCommentsDb as jest.MockedFunction<typeof getCommentsDb>
const mockCreateComment = createCommentDb as jest.MockedFunction<typeof createCommentDb>

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/comments/test-slug`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
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
})
