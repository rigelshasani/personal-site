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

// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Request for API tests
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.body = options.body
    this.headers = options.headers || {}
  }
  
  async json() {
    return JSON.parse(this.body)
  }
}