/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Mock next-auth middleware
const mockWithAuth = jest.fn()
jest.mock('next-auth/middleware', () => ({
  __esModule: true,
  withAuth: mockWithAuth,
}))

// Mock NextResponse 
const mockRedirect = jest.fn()
const mockNext = jest.fn()
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: mockRedirect,
    next: mockNext,
  },
}))

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_GITHUB_LOGINS = 'testadmin,anotheradmin'
  })

  afterEach(() => {
    jest.resetModules()
  })

  it('should protect admin routes with authentication', async () => {
    // Mock the middleware function that withAuth receives
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn, config) => {
      middlewareFunction = fn
      return fn
    })

    // Import middleware after mocking
    require('../src/middleware')

    // Verify withAuth was called with correct config
    expect(mockWithAuth).toHaveBeenCalled()
    const [, config] = mockWithAuth.mock.calls[0]
    
    expect(config.callbacks.authorized).toBeDefined()
    
    // Test authorized callback
    const authorizedCallback = config.callbacks.authorized
    
    // Test non-admin route with no token - should allow
    const nonAdminResult = authorizedCallback({
      token: null,
      req: { nextUrl: { pathname: '/' } }
    })
    expect(nonAdminResult).toBe(true)
    
    // Test admin route with no token - should require auth
    const adminNoTokenResult = authorizedCallback({
      token: null,
      req: { nextUrl: { pathname: '/admin' } }
    })
    expect(adminNoTokenResult).toBe(false)
    
    // Test admin route with valid token - should allow
    const adminWithTokenResult = authorizedCallback({
      token: { login: 'testadmin' },
      req: { nextUrl: { pathname: '/admin' } }
    })
    expect(adminWithTokenResult).toBe(true)
  })

  it('should redirect non-admin users from admin routes', async () => {
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/middleware')

    // Create mock request for admin route
    const mockRequest = {
      nextUrl: { pathname: '/admin/create' },
      nextauth: { token: { login: 'regularuser' } },
      url: 'http://localhost:3000/admin/create'
    } as any

    // Call the middleware function
    const result = middlewareFunction(mockRequest)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/', mockRequest.url))
  })

  it('should allow admin users to access admin routes', async () => {
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/middleware')

    // Create mock request for admin user
    const mockRequest = {
      nextUrl: { pathname: '/admin' },
      nextauth: { token: { login: 'testadmin' } },
      url: 'http://localhost:3000/admin'
    } as any

    // Call the middleware function
    const result = middlewareFunction(mockRequest)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should handle missing admin logins environment variable', async () => {
    delete process.env.ADMIN_GITHUB_LOGINS

    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/middleware')

    const mockRequest = {
      nextUrl: { pathname: '/admin' },
      nextauth: { token: { login: 'testadmin' } },
      url: 'http://localhost:3000/admin'
    } as any

    // Should redirect since no admin logins are configured
    const result = middlewareFunction(mockRequest)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/', mockRequest.url))
  })

  it('should handle non-admin paths correctly', async () => {
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/middleware')

    const mockRequest = {
      nextUrl: { pathname: '/posts/some-post' },
      nextauth: { token: { login: 'regularuser' } },
      url: 'http://localhost:3000/posts/some-post'
    } as any

    // Should continue normally for non-admin paths
    const result = middlewareFunction(mockRequest)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should have correct matcher config', () => {
    const middleware = require('../src/middleware')
    
    expect(middleware.config).toBeDefined()
    expect(middleware.config.matcher).toEqual(['/admin/:path*', '/api/admin/:path*'])
  })

  it('should handle API admin routes', async () => {
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/middleware')

    const mockRequest = {
      nextUrl: { pathname: '/api/admin/posts' },
      nextauth: { token: { login: 'regularuser' } },
      url: 'http://localhost:3000/api/admin/posts'
    } as any

    // Should redirect non-admin users from API routes
    const result = middlewareFunction(mockRequest)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/', mockRequest.url))
  })
})