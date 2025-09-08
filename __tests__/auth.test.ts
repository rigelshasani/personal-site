import { getAdminSession, requireAdmin, isAdmin } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Authentication Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variable
    process.env.ADMIN_GITHUB_LOGINS = 'testadmin,anothertestadmin'
  })

  describe('getAdminSession', () => {
    it('should return null when no session exists', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const result = await getAdminSession()
      expect(result).toBeNull()
    })

    it('should return null when user is not an admin', async () => {
      const mockSession = {
        user: {
          login: 'regularuser',
          email: 'user@example.com',
          name: 'Regular User',
        },
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const result = await getAdminSession()
      expect(result).toBeNull()
    })

    it('should return session when user is an admin', async () => {
      const mockSession = {
        user: {
          login: 'testadmin',
          email: 'admin@example.com',
          name: 'Test Admin',
        },
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const result = await getAdminSession()
      expect(result).toEqual(mockSession)
    })

    it('should return null when no login in session', async () => {
      const mockSession = {
        user: {
          email: 'user@example.com',
          name: 'User',
        },
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const result = await getAdminSession()
      expect(result).toBeNull()
    })
  })

  describe('requireAdmin', () => {
    it('should throw error when no admin session', async () => {
      mockGetServerSession.mockResolvedValue(null)

      await expect(requireAdmin()).rejects.toThrow('Unauthorized: Admin access required')
    })

    it('should return session when user is admin', async () => {
      const mockSession = {
        user: {
          login: 'testadmin',
          email: 'admin@example.com',
          name: 'Test Admin',
        },
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const result = await requireAdmin()
      expect(result).toEqual(mockSession)
    })
  })

  describe('isAdmin', () => {
    it('should return false for null login', () => {
      expect(isAdmin(null)).toBe(false)
      expect(isAdmin(undefined)).toBe(false)
    })

    it('should return false for non-admin user', () => {
      expect(isAdmin('regularuser')).toBe(false)
    })

    it('should return true for admin user', () => {
      expect(isAdmin('testadmin')).toBe(true)
      expect(isAdmin('anothertestadmin')).toBe(true)
    })

    it('should handle missing environment variable', () => {
      delete process.env.ADMIN_GITHUB_LOGINS
      expect(isAdmin('testadmin')).toBe(false)
    })
  })
})