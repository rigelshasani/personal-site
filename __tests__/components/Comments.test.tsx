/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Comments } from '@/components/Comments';
import * as formatModule from '@/lib/format';

jest.mock('@/lib/format');
const mockFormat = formatModule as jest.Mocked<typeof formatModule>;

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Comments Component', () => {
  const testSlug = 'test-post-slug';
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormat.formatDate.mockReturnValue('Jan 15, 2024');
    // Default: GET returns empty list
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ success: true, comments: [] }),
    });
  });

  it('should render comments section with title', async () => {
    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Comments');
  });

  it('should show empty state when no comments exist', async () => {
    render(<Comments slug={testSlug} />);
    await waitFor(() => {
      expect(screen.getByText('No comments yet. Be the first to share your thoughts!')).toBeInTheDocument();
    });
  });

  it('should render comment form with textarea and submit button', async () => {
    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    const textarea = screen.getByLabelText('Write your comment');
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });

    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', "Share your thoughts anonymously... (You'll get a random username)");
    expect(textarea).toHaveAttribute('maxLength', '1000');
    expect(submitButton).toBeInTheDocument();
  });

  it('should show character count', async () => {
    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    const textarea = screen.getByLabelText('Write your comment');
    expect(screen.getByText('0/1000')).toBeInTheDocument();

    await user.type(textarea, 'Hello world');
    expect(screen.getByText('11/1000')).toBeInTheDocument();
  });

  it('should disable submit button when textarea is empty', async () => {
    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    expect(screen.getByRole('button', { name: 'Post Comment' })).toBeDisabled();
  });

  it('should enable submit button when textarea has content', async () => {
    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    await user.type(screen.getByLabelText('Write your comment'), 'Test comment');
    expect(screen.getByRole('button', { name: 'Post Comment' })).toBeEnabled();
  });

  it('should call the comments API on submit and clear the form', async () => {
    const newComment = {
      id: '1',
      username: 'AnonymousReader123',
      content: 'This is a test comment',
      timestamp: '2024-01-15T10:00:00.000Z',
    };
    mockFetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: true, comments: [] }) })
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: true, comment: newComment }) });

    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    await user.type(screen.getByLabelText('Write your comment'), 'This is a test comment');
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));

    await waitFor(() => expect(screen.getByLabelText('Write your comment')).toHaveValue(''));

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/comments/${testSlug}`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('This is a test comment'),
      })
    );
  });

  it('should display submitted comment in the list', async () => {
    const newComment = {
      id: '1',
      username: 'AnonymousReader123',
      content: 'My test comment',
      timestamp: '2024-01-15T10:00:00.000Z',
    };
    mockFetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: true, comments: [] }) })
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: true, comment: newComment }) });

    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    await user.type(screen.getByLabelText('Write your comment'), 'My test comment');
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));

    await waitFor(() => {
      expect(screen.getByText('My test comment')).toBeInTheDocument();
    });
    expect(screen.queryByText('No comments yet. Be the first to share your thoughts!')).not.toBeInTheDocument();
  });

  it('should load existing comments from the API on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        success: true,
        comments: [
          { id: '1', username: 'TestUser123', content: 'Existing comment', timestamp: '2024-01-15T10:00:00.000Z' },
        ],
      }),
    });

    render(<Comments slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText('Existing comment')).toBeInTheDocument();
      expect(screen.getByText('TestUser123')).toBeInTheDocument();
    });
  });

  it('should show comment count in title when comments exist', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        success: true,
        comments: [
          { id: '1', username: 'User1', content: 'Comment 1', timestamp: '2024-01-15T10:00:00.000Z' },
          { id: '2', username: 'User2', content: 'Comment 2', timestamp: '2024-01-15T11:00:00.000Z' },
        ],
      }),
    });

    render(<Comments slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText('Comments (2)')).toBeInTheDocument();
    });
  });

  it('should show error message when API returns failure', async () => {
    mockFetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: true, comments: [] }) })
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: false, error: 'Server error' }) });

    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    await user.type(screen.getByLabelText('Write your comment'), 'Test comment');
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('should not submit empty or whitespace-only comments', async () => {
    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    await user.type(screen.getByLabelText('Write your comment'), '   ');
    expect(screen.getByRole('button', { name: 'Post Comment' })).toBeDisabled();
  });

  it('should format comment timestamps', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        success: true,
        comments: [
          { id: '1', username: 'TestUser', content: 'Test comment', timestamp: '2024-01-15T10:00:00.000Z' },
        ],
      }),
    });

    render(<Comments slug={testSlug} />);

    await waitFor(() => {
      expect(mockFormat.formatDate).toHaveBeenCalledWith('2024-01-15T10:00:00.000Z');
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    });
  });

  it('should preserve line breaks in comment content', async () => {
    const newComment = {
      id: '1',
      username: 'AnonymousReader123',
      content: 'Line 1\nLine 2\nLine 3',
      timestamp: '2024-01-15T10:00:00.000Z',
    };
    mockFetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: true, comments: [] }) })
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: true, comment: newComment }) });

    render(<Comments slug={testSlug} />);
    await waitFor(() => expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument());

    await user.type(screen.getByLabelText('Write your comment'), 'Line 1\nLine 2\nLine 3');
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));

    await waitFor(() => {
      const commentEl = screen.getByText((_, el) => el?.textContent === 'Line 1\nLine 2\nLine 3');
      expect(commentEl).toHaveClass('whitespace-pre-wrap');
    });
  });
});
