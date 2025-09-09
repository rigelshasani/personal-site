/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '@/app/admin/page';
import * as formatModule from '@/lib/format';

// Mock format functions
jest.mock('@/lib/format');
const mockFormat = formatModule as jest.Mocked<typeof formatModule>;

// Mock Next.js Link
jest.mock('next/link', () => {
  return function Link({ children, href, className, target }: any) {
    return (
      <a href={href} className={className} target={target}>
        {children}
      </a>
    );
  };
});

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window methods
const mockConfirm = jest.fn();
const mockAlert = jest.fn();

Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
});

// Note: JSDOM doesn't support mocking location.reload properly, so we'll test the API call instead

describe('Admin Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormat.formatDate.mockImplementation((date) => `Formatted: ${date}`);
  });

  it('should show loading state initially', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminDashboard />);

    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('should render dashboard with posts after loading', async () => {
    const mockPosts = [
      {
        slug: 'test-post-1',
        meta: {
          title: 'Test Post 1',
          description: 'First test post description',
          date: '2024-01-01',
          tags: ['tech', 'programming'],
        },
        readingTime: '5 min read'
      },
      {
        slug: 'test-post-2',
        meta: {
          title: 'Test Post 2',
          description: 'Second test post description',
          date: '2024-01-02',
          tags: ['analytics'],
        },
        readingTime: '3 min read'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Posts (2)')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Posts (2)' })).toBeInTheDocument();
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.getByText('First test post description')).toBeInTheDocument();
    expect(screen.getByText('Second test post description')).toBeInTheDocument();
  });

  it('should render create new post button', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    } as Response);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Posts (0)')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('link', { name: 'Create New Post' });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute('href', '/admin/create');
  });

  it('should display post metadata correctly', async () => {
    const mockPosts = [
      {
        slug: 'detailed-post',
        meta: {
          title: 'Detailed Post',
          description: 'A post with all metadata',
          date: '2024-01-15',
          tags: ['tech', 'tutorial', 'react'],
        },
        readingTime: '8 min read'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Detailed Post')).toBeInTheDocument();
    });

    expect(screen.getByText('A post with all metadata')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('8 min read')).toBeInTheDocument();
    expect(screen.getByText('tech, tutorial, react')).toBeInTheDocument();
  });

  it('should handle posts without tags', async () => {
    const mockPosts = [
      {
        slug: 'no-tags-post',
        meta: {
          title: 'Post Without Tags',
          description: 'A post without tags',
          date: '2024-01-01',
        },
        readingTime: '2 min read'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Post Without Tags')).toBeInTheDocument();
    });

    expect(screen.getByText('A post without tags')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('2 min read')).toBeInTheDocument();
    // Should not show tags section
    expect(screen.queryByText(/tech|programming/)).not.toBeInTheDocument();
  });

  it('should render view and edit links for each post', async () => {
    const mockPosts = [
      {
        slug: 'test-post',
        meta: {
          title: 'Test Post',
          description: 'Test description',
          date: '2024-01-01',
        },
        readingTime: '3 min read'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    const viewLink = screen.getByRole('link', { name: 'View' });
    const editLink = screen.getByRole('link', { name: 'Edit' });

    expect(viewLink).toBeInTheDocument();
    expect(viewLink).toHaveAttribute('href', '/posts/test-post');
    expect(viewLink).toHaveAttribute('target', '_blank');

    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute('href', '/admin/edit/test-post');
  });

  it('should handle delete button click with confirmation', async () => {
    const mockPosts = [
      {
        slug: 'delete-test',
        meta: {
          title: 'Delete Test Post',
          description: 'Post to be deleted',
          date: '2024-01-01',
        },
        readingTime: '2 min read'
      }
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: mockPosts }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
      } as Response);

    mockConfirm.mockReturnValue(true);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Delete Test Post')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith('Delete "Delete Test Post"? This cannot be undone.');
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts/delete-test', {
        method: 'DELETE',
      });
    });

    // Note: We can't test window.location.reload in JSDOM, but the API call was successful
  });

  it('should cancel delete when user clicks cancel in confirmation', async () => {
    const mockPosts = [
      {
        slug: 'cancel-delete-test',
        meta: {
          title: 'Cancel Delete Test',
          description: 'Post deletion cancelled',
          date: '2024-01-01',
        },
        readingTime: '1 min read'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    mockConfirm.mockReturnValue(false);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Delete Test')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith('Delete "Cancel Delete Test"? This cannot be undone.');
    
    // Should not make delete API call
    expect(mockFetch).toHaveBeenCalledTimes(1); // Only initial fetch
  });

  it('should handle delete API failure', async () => {
    const mockPosts = [
      {
        slug: 'failed-delete',
        meta: {
          title: 'Failed Delete Post',
          description: 'Delete will fail',
          date: '2024-01-01',
        },
        readingTime: '1 min read'
      }
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: mockPosts }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

    mockConfirm.mockReturnValue(true);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed Delete Post')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to delete post');
    });

    // API failure handled, no reload should happen
  });

  it('should handle delete network error', async () => {
    const mockPosts = [
      {
        slug: 'network-error',
        meta: {
          title: 'Network Error Post',
          description: 'Network error on delete',
          date: '2024-01-01',
        },
        readingTime: '1 min read'
      }
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: mockPosts }),
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    mockConfirm.mockReturnValue(true);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Network Error Post')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to delete post');
    });
  });

  it('should display empty state when no posts exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    } as Response);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Posts (0)')).toBeInTheDocument();
    });

    expect(screen.getByText('No posts yet.')).toBeInTheDocument();
    
    const createFirstPostLink = screen.getByRole('link', { name: 'Create your first post' });
    expect(createFirstPostLink).toBeInTheDocument();
    expect(createFirstPostLink).toHaveAttribute('href', '/admin/create');
  });

  it('should handle fetch error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Posts (0)')).toBeInTheDocument();
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to fetch posts:', expect.any(Error));
    expect(screen.getByText('No posts yet.')).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('should handle non-ok response from posts API', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Posts (0)')).toBeInTheDocument();
    });

    expect(screen.getByText('No posts yet.')).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('should render all posts section header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    } as Response);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Posts (0)')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { level: 2, name: 'All Posts' })).toBeInTheDocument();
  });
});