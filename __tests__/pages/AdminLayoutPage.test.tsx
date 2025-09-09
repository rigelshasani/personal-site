/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AdminLayout from '@/app/admin/layout';
import * as authModule from '@/lib/auth';

// Mock auth functions
jest.mock('@/lib/auth', () => ({
  requireAdmin: jest.fn(),
}));
const mockAuth = authModule as jest.Mocked<typeof authModule>;

// Mock Next.js redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

// Mock Next.js Link
jest.mock('next/link', () => {
  return function Link({ children, href, className }: any) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('Admin Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render admin layout when user is authorized', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div data-testid="test-children">Test Content</div>;
    
    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should redirect to home when user is not authorized', async () => {
    mockAuth.requireAdmin.mockRejectedValueOnce(new Error('Unauthorized'));

    const TestChildren = () => <div data-testid="test-children">Test Content</div>;
    
    await AdminLayout({ children: <TestChildren /> });

    expect(mockAuth.requireAdmin).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('should render navigation with correct links', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Test Content</div>;
    
    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    // Check main navigation links
    const dashboardLink = screen.getByRole('link', { name: 'Admin Dashboard' });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/admin');

    const postsLink = screen.getByRole('link', { name: 'Posts' });
    expect(postsLink).toBeInTheDocument();
    expect(postsLink).toHaveAttribute('href', '/admin');

    const newPostButton = screen.getByRole('link', { name: 'New Post' });
    expect(newPostButton).toBeInTheDocument();
    expect(newPostButton).toHaveAttribute('href', '/admin/create');

    const backToSiteLink = screen.getByRole('link', { name: '← Back to Site' });
    expect(backToSiteLink).toBeInTheDocument();
    expect(backToSiteLink).toHaveAttribute('href', '/');
  });

  it('should render main content area with children', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => (
      <div data-testid="admin-content">
        <h1>Admin Page Content</h1>
        <p>This is the admin content</p>
      </div>
    );
    
    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    const content = screen.getByTestId('admin-content');
    expect(content).toBeInTheDocument();
    expect(screen.getByText('Admin Page Content')).toBeInTheDocument();
    expect(screen.getByText('This is the admin content')).toBeInTheDocument();
  });

  it('should have correct layout structure', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Content</div>;
    
    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    // Check for proper layout structure
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for styling', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Content</div>;
    
    const component = await AdminLayout({ children: <TestChildren /> });
    const { container } = render(component);

    // Check that the main container has the expected class
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-gray-900');

    // Check navigation styling
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'border-b', 'border-gray-200', 'dark:border-gray-700');

    // Check main content area styling
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-7xl', 'mx-auto', 'py-6', 'px-4', 'sm:px-6', 'lg:px-8');
  });

  it('should handle requireAdmin rejection without error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockAuth.requireAdmin.mockRejectedValueOnce(new Error('Access denied'));

    const TestChildren = () => <div>Content</div>;
    
    await AdminLayout({ children: <TestChildren /> });

    expect(mockRedirect).toHaveBeenCalledWith('/');
    // Should not log errors since we catch the rejection
    expect(consoleError).not.toHaveBeenCalled();
    
    consoleError.mockRestore();
  });

  it('should render New Post button with correct styling', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Content</div>;
    
    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    const newPostButton = screen.getByRole('link', { name: 'New Post' });
    expect(newPostButton).toHaveClass(
      'bg-blue-600',
      'hover:bg-blue-700',
      'text-white',
      'px-4',
      'py-2',
      'rounded-md',
      'text-sm',
      'font-medium',
      'transition-colors'
    );
  });

  it('should render dashboard title with correct styling', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Content</div>;
    
    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    const dashboardTitle = screen.getByRole('link', { name: 'Admin Dashboard' });
    expect(dashboardTitle).toHaveClass(
      'text-xl',
      'font-semibold',
      'text-gray-900',
      'dark:text-white'
    );
  });

  it('should render navigation links with hover effects', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Content</div>;
    
    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    const postsLink = screen.getByRole('link', { name: 'Posts' });
    expect(postsLink).toHaveClass(
      'text-gray-600',
      'dark:text-gray-300',
      'hover:text-gray-900',
      'dark:hover:text-white',
      'px-3',
      'py-2',
      'text-sm',
      'font-medium'
    );

    const backToSiteLink = screen.getByRole('link', { name: '← Back to Site' });
    expect(backToSiteLink).toHaveClass(
      'text-gray-600',
      'dark:text-gray-300',
      'hover:text-gray-900',
      'dark:hover:text-white',
      'px-3',
      'py-2',
      'text-sm',
      'font-medium'
    );
  });
});