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
const mockJson = jest.fn()
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: mockRedirect,
    next: mockNext,
    json: mockJson,
  },
}))

describe('Proxy', () => {
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
    require('../src/proxy')

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

    // API routes pass through so the middleware body can answer with a 401
    // instead of next-auth redirecting to the HTML sign-in page.
    const apiNoTokenResult = authorizedCallback({
      token: null,
      req: { nextUrl: { pathname: '/api/admin/posts' } }
    })
    expect(apiNoTokenResult).toBe(true)
    
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

    require('../src/proxy')

    // Create mock request for admin route
    const mockRequest = {
      nextUrl: { pathname: '/admin/create' },
      nextauth: { token: { login: 'regularuser' } },
      url: 'http://localhost:3000/admin/create'
    } as any

    // Call the middleware function
    const result = middlewareFunction(mockRequest)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/admin/login', mockRequest.url))
  })

  it('should allow admin users to access admin routes', async () => {
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/proxy')

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

    require('../src/proxy')

    const mockRequest = {
      nextUrl: { pathname: '/admin' },
      nextauth: { token: { login: 'testadmin' } },
      url: 'http://localhost:3000/admin'
    } as any

    // Should redirect since no admin logins are configured
    const result = middlewareFunction(mockRequest)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/admin/login', mockRequest.url))
  })

  it('should handle non-admin paths correctly', async () => {
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/proxy')

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
    const middleware = require('../src/proxy')
    
    expect(middleware.config).toBeDefined()
    expect(middleware.config.matcher).toEqual(['/admin/:path*', '/api/admin/:path*'])
  })

  it('should return 401 JSON for non-admin API requests', async () => {
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/proxy')

    const mockRequest = {
      nextUrl: { pathname: '/api/admin/posts' },
      nextauth: { token: { login: 'regularuser' } },
      url: 'http://localhost:3000/api/admin/posts'
    } as any

    middlewareFunction(mockRequest)

    // A redirect here would hand the caller an HTML sign-in page to parse as JSON.
    expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 })
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should let admin users through to API routes', async () => {
    let middlewareFunction: any

    mockWithAuth.mockImplementation((fn) => {
      middlewareFunction = fn
      return fn
    })

    require('../src/proxy')

    const mockRequest = {
      nextUrl: { pathname: '/api/admin/posts' },
      nextauth: { token: { login: 'testadmin' } },
      url: 'http://localhost:3000/api/admin/posts'
    } as any

    middlewareFunction(mockRequest)

    expect(mockNext).toHaveBeenCalled()
    expect(mockJson).not.toHaveBeenCalled()
  })
})