// Environment variables are set in jest.setup.js

// Mock GitHubProvider
jest.mock('next-auth/providers/github', () => {
  return jest.fn().mockImplementation((config) => ({
    id: 'github',
    name: 'GitHub',
    type: 'oauth',
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  }))
})

import GitHubProvider from 'next-auth/providers/github'
import { authOptions } from '@/lib/auth-config'

const mockGitHubProvider = GitHubProvider as jest.MockedFunction<typeof GitHubProvider>

describe('Auth Configuration', () => {
  it('should have correct basic configuration', () => {
    expect(authOptions).toBeDefined()
    expect(authOptions.secret).toBe('test-secret') // Set by jest.setup.js
    expect(authOptions.pages?.signIn).toBe('/admin/login')
  })

  it('should configure GitHub provider correctly', () => {
    // Check that the GitHub provider was called with correct config during module initialization
    expect(mockGitHubProvider).toHaveBeenCalledWith({
      clientId: 'test-github-id',
      clientSecret: 'test-github-secret',
    })

    // Access providers to verify configuration
    const providers = authOptions.providers
    expect(providers).toHaveLength(1)
  })

  it('should have session callback that adds login to session', async () => {
    const mockSession = {
      user: {
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockToken = {
      login: 'testuser',
      sub: 'user-id',
    }

    const sessionCallback = authOptions.callbacks?.session
    expect(sessionCallback).toBeDefined()

    if (sessionCallback) {
      const result = await sessionCallback({
        session: mockSession as any,
        token: mockToken as any,
      })

      expect(result.user.login).toBe('testuser')
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.name).toBe('Test User')
    }
  })

  it('should handle session callback without login in token', async () => {
    const mockSession = {
      user: {
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockToken = {
      sub: 'user-id',
    }

    const sessionCallback = authOptions.callbacks?.session
    if (sessionCallback) {
      const result = await sessionCallback({
        session: mockSession as any,
        token: mockToken as any,
      })

      expect(result.user.login).toBeUndefined()
      expect(result.user.email).toBe('test@example.com')
    }
  })

  it('should have JWT callback that extracts login from profile', async () => {
    const mockToken = {
      sub: 'user-id',
    }

    const mockAccount = {
      provider: 'github',
      type: 'oauth',
    }

    const mockProfile = {
      login: 'githubuser',
      id: 12345,
      email: 'user@github.com',
    }

    const jwtCallback = authOptions.callbacks?.jwt
    expect(jwtCallback).toBeDefined()

    if (jwtCallback) {
      const result = await jwtCallback({
        token: mockToken as any,
        account: mockAccount as any,
        profile: mockProfile as any,
      })

      expect(result.login).toBe('githubuser')
      expect(result.sub).toBe('user-id')
    }
  })

  it('should handle JWT callback without account and profile', async () => {
    const mockToken = {
      sub: 'user-id',
      login: 'existing-login',
    }

    const jwtCallback = authOptions.callbacks?.jwt
    if (jwtCallback) {
      const result = await jwtCallback({
        token: mockToken as any,
        account: null,
        profile: null,
      })

      expect(result.login).toBe('existing-login')
      expect(result.sub).toBe('user-id')
    }
  })

  it('should handle JWT callback with account but no profile', async () => {
    const mockToken = {
      sub: 'user-id',
    }

    const mockAccount = {
      provider: 'github',
      type: 'oauth',
    }

    const jwtCallback = authOptions.callbacks?.jwt
    if (jwtCallback) {
      const result = await jwtCallback({
        token: mockToken as any,
        account: mockAccount as any,
        profile: null,
      })

      expect(result.login).toBeUndefined()
      expect(result.sub).toBe('user-id')
    }
  })

  it('should preserve other token properties in JWT callback', async () => {
    const mockToken = {
      sub: 'user-id',
      exp: 1234567890,
      iat: 1234567880,
      customProperty: 'custom-value',
    }

    const jwtCallback = authOptions.callbacks?.jwt
    if (jwtCallback) {
      const result = await jwtCallback({
        token: mockToken as any,
        account: null,
        profile: null,
      })

      expect(result.sub).toBe('user-id')
      expect(result.exp).toBe(1234567890)
      expect(result.iat).toBe(1234567880)
      expect((result as any).customProperty).toBe('custom-value')
    }
  })

  it('should handle environment variables correctly', () => {
    // Should not throw when accessing authOptions
    expect(authOptions).toBeDefined()
    expect(authOptions.providers).toHaveLength(1)
    expect(authOptions.secret).toBeDefined()
  })
})