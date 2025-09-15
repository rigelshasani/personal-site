import { POST } from '@/app/api/admin/posts/route'
import { PUT, DELETE } from '@/app/api/admin/posts/[slug]/route'
import { requireAdmin } from '@/lib/auth'
import { createPostFile, updatePostFile, deletePostFile, generateSlug } from '@/lib/post-utils'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/post-utils')

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>
const mockCreatePostFile = createPostFile as jest.MockedFunction<typeof createPostFile>
const mockUpdatePostFile = updatePostFile as jest.MockedFunction<typeof updatePostFile>
const mockDeletePostFile = deletePostFile as jest.MockedFunction<typeof deletePostFile>
const mockGenerateSlug = generateSlug as jest.MockedFunction<typeof generateSlug>

describe('/api/admin/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/admin/posts', () => {
    const validPostData = {
      meta: {
        title: 'Test Post',
        description: 'Test description',
        date: '2023-12-01',
        tags: ['test'],
      },
      content: '# Test content',
    }

    it('should create post successfully for admin user', async () => {
      mockRequireAdmin.mockResolvedValue({ user: { login: 'testadmin' } } as any)
      mockGenerateSlug.mockReturnValue('test-post')
      mockCreatePostFile.mockReturnValue(undefined)

      const request = new NextRequest('http://localhost/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify(validPostData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockCreatePostFile).toHaveBeenCalledWith(
        'test-post',
        validPostData.meta,
        validPostData.content
      )
    })

    it('should return 401 for non-admin user', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))

      const request = new NextRequest('http://localhost/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify(validPostData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized: Admin access required')
    })

    it('should return 400 for invalid post data', async () => {
      mockRequireAdmin.mockResolvedValue({ user: { login: 'testadmin' } } as any)

      const request = new NextRequest('http://localhost/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify({
          meta: { title: '', description: '', date: '' },
          content: '',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should handle file creation errors', async () => {
      mockRequireAdmin.mockResolvedValue({ user: { login: 'testadmin' } } as any)
      mockCreatePostFile.mockImplementation(() => {
        throw new Error('Post with this slug already exists')
      })

      const request = new NextRequest('http://localhost/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify(validPostData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Post with this slug already exists')
    })
  })

  describe('PUT /api/admin/posts/[slug]', () => {
    const validPostData = {
      meta: {
        title: 'Updated Post',
        description: 'Updated description',
        date: '2023-12-01',
      },
      content: '# Updated content',
    }

    const mockContext = {
      params: Promise.resolve({ slug: 'test-post' }),
    }

    it('should update post successfully for admin user', async () => {
      mockRequireAdmin.mockResolvedValue({ user: { login: 'testadmin' } } as any)
      mockUpdatePostFile.mockReturnValue(undefined)

      const request = new NextRequest('http://localhost/api/admin/posts/test-post', {
        method: 'PUT',
        body: JSON.stringify(validPostData),
      })

      const response = await PUT(request, mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockUpdatePostFile).toHaveBeenCalledWith(
        'test-post',
        validPostData.meta,
        validPostData.content
      )
    })

    it('should return 401 for non-admin user', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))

      const request = new NextRequest('http://localhost/api/admin/posts/test-post', {
        method: 'PUT',
        body: JSON.stringify(validPostData),
      })

      const response = await PUT(request, mockContext)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized: Admin access required')
    })

    it('should handle post not found error', async () => {
      mockRequireAdmin.mockResolvedValue({ user: { login: 'testadmin' } } as any)
      mockUpdatePostFile.mockImplementation(() => {
        throw new Error('Post not found')
      })

      const request = new NextRequest('http://localhost/api/admin/posts/nonexistent', {
        method: 'PUT',
        body: JSON.stringify(validPostData),
      })

      const response = await PUT(request, mockContext)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Post not found')
    })
  })

  describe('DELETE /api/admin/posts/[slug]', () => {
    const mockContext = {
      params: Promise.resolve({ slug: 'test-post' }),
    }

    it('should delete post successfully for admin user', async () => {
      mockRequireAdmin.mockResolvedValue({ user: { login: 'testadmin' } } as any)
      mockDeletePostFile.mockReturnValue(undefined)

      const request = new NextRequest('http://localhost/api/admin/posts/test-post', {
        method: 'DELETE',
      })

      const response = await DELETE(request, mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockDeletePostFile).toHaveBeenCalledWith('test-post')
    })

    it('should return 401 for non-admin user', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))

      const request = new NextRequest('http://localhost/api/admin/posts/test-post', {
        method: 'DELETE',
      })

      const response = await DELETE(request, mockContext)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized: Admin access required')
    })

    it('should handle post not found error', async () => {
      mockRequireAdmin.mockResolvedValue({ user: { login: 'testadmin' } } as any)
      mockDeletePostFile.mockImplementation(() => {
        throw new Error('Post not found')
      })

      const request = new NextRequest('http://localhost/api/admin/posts/nonexistent', {
        method: 'DELETE',
      })

      const response = await DELETE(request, mockContext)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Post not found')
    })
  })
})
