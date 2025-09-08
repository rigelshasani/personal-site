import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { AdminLoginButton } from '@/components/AdminLoginButton'

// Mock next-auth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

describe('AdminLoginButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS = 'testadmin'
  })

  it('should not render anything while loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    })

    const { container } = render(<AdminLoginButton />)
    expect(container.firstChild).toBeNull()
  })

  it('should render subtle login button when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<AdminLoginButton />)
    
    const button = screen.getByRole('button', { name: '•' })
    expect(button).toBeInTheDocument()
    expect(button.parentElement).toHaveClass('opacity-10')
  })

  it('should show login button on hover', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<AdminLoginButton />)
    
    const container = screen.getByRole('button').parentElement?.parentElement
    expect(container).toBeInTheDocument()
    
    // Test hover effect by checking classes
    fireEvent.mouseEnter(container!)
    expect(container?.querySelector('.opacity-100')).toBeInTheDocument()
  })

  it('should call signIn when login button clicked', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<AdminLoginButton />)
    
    const button = screen.getByRole('button', { name: '•' })
    fireEvent.click(button)
    
    expect(mockSignIn).toHaveBeenCalledWith('github')
  })

  it('should render admin panel link when authenticated as admin', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          login: 'testadmin',
          name: 'Test Admin',
          email: 'admin@example.com',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<AdminLoginButton />)
    
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    
    const adminLink = screen.getByRole('link', { name: 'Admin' })
    expect(adminLink).toHaveAttribute('href', '/admin')
  })

  it('should call signOut when logout button clicked', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          login: 'testadmin',
          name: 'Test Admin',
          email: 'admin@example.com',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<AdminLoginButton />)
    
    const logoutButton = screen.getByRole('button', { name: 'Logout' })
    fireEvent.click(logoutButton)
    
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should not render admin controls for non-admin user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          login: 'regularuser',
          name: 'Regular User',
          email: 'user@example.com',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<AdminLoginButton />)
    
    // Should render login button since user is not admin
    const button = screen.getByRole('button', { name: '•' })
    expect(button).toBeInTheDocument()
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })
})