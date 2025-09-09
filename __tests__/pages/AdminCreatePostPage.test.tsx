/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CreatePostPage from '@/app/admin/create/page';

// Mock Next.js useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock PostEditor component
jest.mock('@/components/PostEditor', () => ({
  PostEditor: ({ onSave, onCancel }: any) => (
    <div data-testid="post-editor">
      <button onClick={() => onSave({ title: 'Test Post' }, 'Test content')}>
        Save Post
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Admin Create Post Page', () => {
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
  });

  it('should render create post page header', () => {
    render(<CreatePostPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Create New Post' })).toBeInTheDocument();
    expect(screen.getByText('Write and publish a new blog post using the MDX editor below.')).toBeInTheDocument();
  });

  it('should render PostEditor component', () => {
    render(<CreatePostPage />);

    expect(screen.getByTestId('post-editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Post' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should handle successful post creation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<CreatePostPage />);

    const saveButton = screen.getByRole('button', { name: 'Save Post' });
    
    // Simulate saving through PostEditor
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meta: { title: 'Test Post' },
          content: 'Test content'
        }),
      });
    });
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('should handle post creation failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<CreatePostPage />);

    const saveButton = screen.getByRole('button', { name: 'Save Post' });
    
    // Verify fetch is called but router.push is not called due to error
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meta: { title: 'Test Post' },
          content: 'Test content'
        }),
      });
    });

    // Give some time for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle network error during post creation', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<CreatePostPage />);

    const saveButton = screen.getByRole('button', { name: 'Save Post' });
    
    // Verify fetch is called but router.push is not called due to error
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meta: { title: 'Test Post' },
          content: 'Test content'
        }),
      });
    });

    // Give some time for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle cancel action', () => {
    render(<CreatePostPage />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    cancelButton.click();

    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('should pass correct props to PostEditor', () => {
    render(<CreatePostPage />);

    // PostEditor should be rendered without initial values (for create mode)
    const editor = screen.getByTestId('post-editor');
    expect(editor).toBeInTheDocument();
    
    // The mock implementation shows that onSave and onCancel callbacks are passed
    expect(screen.getByRole('button', { name: 'Save Post' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});