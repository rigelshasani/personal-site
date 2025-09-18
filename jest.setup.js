import '@testing-library/jest-dom'

// Mock next-auth for testing
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ 
    data: null, 
    status: 'loading' 
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Monaco editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  ),
}))

// Mock environment variables
process.env.ADMIN_GITHUB_LOGINS = 'testadmin'
process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS = 'testadmin'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.GITHUB_ID = 'test-github-id'
process.env.GITHUB_SECRET = 'test-github-secret'

// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Request and Response for API tests (compatible with WHATWG Fetch)
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this._url = url
    this.method = options.method || 'GET'
    this._body = options.body
    this.headers = new Headers(options.headers || {})
  }
  get url() { return this._url }
  get body() { return this._body }
  async json() { return JSON.parse(this._body) }
  async text() { return String(this._body ?? '') }
}

global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.ok = this.status >= 200 && this.status < 300
  }
  
  static json(object, init) {
    return new MockResponse(JSON.stringify(object), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    })
  }
  
  async json() {
    return JSON.parse(this.body)
  }
  
  async text() {
    return this.body
  }
}

// Silence jsdom "not implemented" errors for browser-only APIs used in UI
// These are behaviorally tested elsewhere; here we avoid noisy console outputs.
// Note: individual tests can override these as needed.
// Provide both global and window-bound versions for reliability
if (typeof global.alert === 'undefined') global.alert = jest.fn()
if (typeof global.confirm === 'undefined') global.confirm = jest.fn(() => true)
try {
  if (global.window) {
    if (typeof global.window.alert === 'undefined') global.window.alert = global.alert
    if (typeof global.window.confirm === 'undefined') global.window.confirm = global.confirm
  }
} catch (_) {}
try {
  if (global.window && global.window.location) {
    // Override only the reload function; keep other properties intact
    global.window.location.reload = jest.fn()
  }
} catch (_) {
  // Best-effort; if jsdom blocks overriding location, ignore
}
