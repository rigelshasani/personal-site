import { NextRequest } from 'next/server'
import { DELETE } from '@/app/api/admin/comments/[id]/route'
import { requireAdmin } from '@/lib/auth'
import { deleteCommentDb } from '@/lib/repos/comments-repo'

jest.mock('@/lib/auth')
jest.mock('@/lib/repos/comments-repo')

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>
const mockDeleteComment = deleteCommentDb as jest.MockedFunction<typeof deleteCommentDb>

const makeRequest = () =>
  new NextRequest('http://localhost/api/admin/comments/1', { method: 'DELETE' })
const makeCtx = (id: string) => ({ params: Promise.resolve({ id }) })

describe('DELETE /api/admin/comments/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdmin.mockResolvedValue({ user: { login: 'testadmin' } } as never)
  })

  it('deletes a comment for an admin user', async () => {
    mockDeleteComment.mockResolvedValue(true)

    const res = await DELETE(makeRequest(), makeCtx('1'))

    expect(res.status).toBe(200)
    expect(mockDeleteComment).toHaveBeenCalledWith(1)
  })

  it('returns 401 for a non-admin user', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))

    const res = await DELETE(makeRequest(), makeCtx('1'))

    expect(res.status).toBe(401)
    expect(mockDeleteComment).not.toHaveBeenCalled()
  })

  it('returns 404 when the comment is already gone', async () => {
    mockDeleteComment.mockResolvedValue(false)

    const res = await DELETE(makeRequest(), makeCtx('1'))

    expect(res.status).toBe(404)
  })

  it.each(['abc', '0', '-1', '1.5'])('rejects the invalid id %p', async (id) => {
    const res = await DELETE(makeRequest(), makeCtx(id))

    expect(res.status).toBe(400)
    expect(mockDeleteComment).not.toHaveBeenCalled()
  })
})
