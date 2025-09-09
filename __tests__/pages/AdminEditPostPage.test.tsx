/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import EditPostPage from '@/app/admin/edit/[slug]/page';

// Mock Next.js useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock React's use hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: jest.fn(),
}));

// Mock PostEditor component
jest.mock('@/components/PostEditor', () => ({
  PostEditor: ({ 
    onSave, 
    onCancel, 
    initialTitle, 
    initialDescription, 
    initialContent,
    initialTags,
    initialProject,
    initialOrder,
    isEditing
  }: any) => (
    <div data-testid="post-editor">
      <div data-testid="initial-title">{initialTitle || ''}</div>
      <div data-testid="initial-description">{initialDescription || ''}</div>
      <div data-testid="initial-content">{initialContent || ''}</div>
      <div data-testid="initial-tags">{initialTags?.join(', ') || ''}</div>
      <div data-testid="initial-project">{initialProject || ''}</div>
      <div data-testid="initial-order">{initialOrder || ''}</div>
      <div data-testid="is-editing">{isEditing?.toString() || ''}</div>
      <button onClick={() => onSave({ title: 'Updated Post' }, 'Updated content')}>
        Save Changes
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

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

describe('Admin Edit Post Page', () => {
  const mockUseHook = require('react').use;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
    mockUseHook.mockReturnValue({ slug: 'test-post' });
  });

  it('should show loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const params = Promise.resolve({ slug: 'test-post' });
    render(<EditPostPage params={params} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render edit page with post data after loading', async () => {
    const mockPost = {
      meta: {
        title: 'Test Post',
        description: 'Test description',
        date: '2024-01-01',
        tags: ['tech', 'programming'],
        project: 'test-project',
        order: 1,
      },
      content: '# Test Post Content\n\nThis is test content.'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: mockPost }),
    } as Response);

    const params = Promise.resolve({ slug: 'test-post' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    expect(screen.getByText('Editing: Test Post')).toBeInTheDocument();
    expect(screen.getByTestId('post-editor')).toBeInTheDocument();
    
    // Check that initial values are passed to PostEditor
    expect(screen.getByTestId('initial-title')).toHaveTextContent('Test Post');
    expect(screen.getByTestId('initial-description')).toHaveTextContent('Test description');
    expect(screen.getByTestId('initial-content')).toHaveTextContent('# Test Post Content\n\nThis is test content.');
    expect(screen.getByTestId('initial-tags')).toHaveTextContent('tech, programming');
    expect(screen.getByTestId('initial-project')).toHaveTextContent('test-project');
    expect(screen.getByTestId('initial-order')).toHaveTextContent('1');
    expect(screen.getByTestId('is-editing')).toHaveTextContent('true');
  });

  it('should handle post not found error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const params = Promise.resolve({ slug: 'non-existent' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText('Post not found')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: '← Back to Dashboard' });
    expect(backButton).toBeInTheDocument();
    
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('should handle server error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const params = Promise.resolve({ slug: 'server-error' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load post')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '← Back to Dashboard' })).toBeInTheDocument();
  });

  it('should handle network error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const params = Promise.resolve({ slug: 'network-error' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load post')).toBeInTheDocument();
    });
    
    consoleError.mockRestore();
  });

  it('should handle successful post update', async () => {
    const mockPost = {
      meta: {
        title: 'Test Post',
        description: 'Test description',
        date: '2024-01-01',
      },
      content: 'Test content'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: mockPost }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
      } as Response);

    const params = Promise.resolve({ slug: 'test-post' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveButton);

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts/test-post', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: { title: 'Updated Post' },
        content: 'Updated content'
      }),
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('should handle post update failure', async () => {
    const mockPost = {
      meta: {
        title: 'Test Post',
        description: 'Test description',
        date: '2024-01-01',
      },
      content: 'Test content'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: mockPost }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

    const params = Promise.resolve({ slug: 'test-post' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    
    await expect(async () => {
      fireEvent.click(saveButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    }).rejects.toThrow('Failed to update post');

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle cancel action', async () => {
    const mockPost = {
      meta: {
        title: 'Test Post',
        description: 'Test description',
        date: '2024-01-01',
      },
      content: 'Test content'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: mockPost }),
    } as Response);

    const params = Promise.resolve({ slug: 'test-post' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('should render delete button and handle delete action', async () => {
    const mockPost = {
      meta: {
        title: 'Post to Delete',
        description: 'This post will be deleted',
        date: '2024-01-01',
      },
      content: 'Content to delete'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: mockPost }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
      } as Response);

    mockConfirm.mockReturnValue(true);

    const params = Promise.resolve({ slug: 'delete-post' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete Post' });
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this post? This action cannot be undone.');
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts/delete-post', {
        method: 'DELETE',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('should cancel delete when user clicks cancel in confirmation', async () => {
    const mockPost = {
      meta: {
        title: 'Cancel Delete Post',
        description: 'Delete will be cancelled',
        date: '2024-01-01',
      },
      content: 'Content'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: mockPost }),
    } as Response);

    mockConfirm.mockReturnValue(false);

    const params = Promise.resolve({ slug: 'cancel-delete' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete Post' });
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    
    // Should not make delete API call
    expect(mockFetch).toHaveBeenCalledTimes(1); // Only initial fetch
    expect(mockPush).not.toHaveBeenCalledWith('/admin');
  });

  it('should handle delete API failure', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const mockPost = {
      meta: {
        title: 'Failed Delete Post',
        description: 'Delete will fail',
        date: '2024-01-01',
      },
      content: 'Content'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: mockPost }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

    mockConfirm.mockReturnValue(true);

    const params = Promise.resolve({ slug: 'failed-delete' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete Post' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to delete post. Please try again.');
    });

    expect(mockPush).not.toHaveBeenCalledWith('/admin');
    
    consoleError.mockRestore();
  });

  it('should handle delete network error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const mockPost = {
      meta: {
        title: 'Network Error Delete',
        description: 'Network error on delete',
        date: '2024-01-01',
      },
      content: 'Content'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: mockPost }),
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    mockConfirm.mockReturnValue(true);

    const params = Promise.resolve({ slug: 'network-error' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete Post' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to delete post. Please try again.');
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to delete post:', expect.any(Error));
    
    consoleError.mockRestore();
  });

  it('should handle posts with missing optional fields', async () => {
    const mockPost = {
      meta: {
        title: 'Minimal Post',
        description: 'Post with minimal metadata',
        date: '2024-01-01',
        // No tags, project, or order
      },
      content: 'Minimal content'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: mockPost }),
    } as Response);

    const params = Promise.resolve({ slug: 'minimal-post' });
    render(<EditPostPage params={params} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument();
    });

    expect(screen.getByText('Editing: Minimal Post')).toBeInTheDocument();
    expect(screen.getByTestId('initial-tags')).toHaveTextContent(''); // Empty tags
    expect(screen.getByTestId('initial-project')).toHaveTextContent(''); // No project
    expect(screen.getByTestId('initial-order')).toHaveTextContent(''); // No order
  });
});