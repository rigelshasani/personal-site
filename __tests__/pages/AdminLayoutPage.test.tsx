/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AdminLayout from '@/app/admin/(protected)/layout';
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

// Mock ThemeToggle (uses client hooks not available in test env)
jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => null,
}));

describe('Admin Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render admin layout when user is authorized', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div data-testid="test-children">Test Content</div>;

    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    expect(screen.getByText('Rigels Admin')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authorized', async () => {
    mockAuth.requireAdmin.mockRejectedValueOnce(new Error('Unauthorized'));

    const TestChildren = () => <div data-testid="test-children">Test Content</div>;

    await AdminLayout({ children: <TestChildren /> });

    expect(mockAuth.requireAdmin).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login');
  });

  it('should render navigation with correct links', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Test Content</div>;

    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    const brandLink = screen.getByRole('link', { name: 'Rigels Admin' });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/admin');

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

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for styling', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Content</div>;

    const component = await AdminLayout({ children: <TestChildren /> });
    const { container } = render(component);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-bg', 'text-foreground');

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('border-b', 'border-border-light', 'sticky');

    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-7xl', 'mx-auto', 'py-8');
  });

  it('should handle requireAdmin rejection without error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockAuth.requireAdmin.mockRejectedValueOnce(new Error('Access denied'));

    const TestChildren = () => <div>Content</div>;

    await AdminLayout({ children: <TestChildren /> });

    expect(mockRedirect).toHaveBeenCalledWith('/admin/login');
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
      'bg-accent',
      'text-white',
      'px-3',
      'py-1.5',
      'rounded-md',
      'text-sm',
      'font-medium',
    );
  });

  it('should render brand title with correct styling', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Content</div>;

    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    const brandTitle = screen.getByRole('link', { name: 'Rigels Admin' });
    expect(brandTitle).toHaveClass('text-lg', 'font-semibold', 'text-foreground');
  });

  it('should render navigation links with hover effects', async () => {
    mockAuth.requireAdmin.mockResolvedValueOnce(undefined);

    const TestChildren = () => <div>Content</div>;

    const component = await AdminLayout({ children: <TestChildren /> });
    render(component);

    const postsLink = screen.getByRole('link', { name: 'Posts' });
    expect(postsLink).toHaveClass('text-mid', 'hover:text-foreground', 'text-sm', 'font-medium');

    const backToSiteLink = screen.getByRole('link', { name: '← Back to Site' });
    expect(backToSiteLink).toHaveClass('text-mid', 'hover:text-foreground', 'text-sm', 'font-medium');
  });
});
