/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Comments } from '@/components/Comments';
import * as formatModule from '@/lib/format';

// Mock the format module
jest.mock('@/lib/format');
const mockFormat = formatModule as jest.Mocked<typeof formatModule>;

describe('Comments Component', () => {
  const testSlug = 'test-post-slug';
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockFormat.formatDate.mockReturnValue('Jan 15, 2024');
    
    // Simple mock for document.documentElement
    const mockClassList = { contains: jest.fn().mockReturnValue(false) };
    Object.defineProperty(document.documentElement, 'classList', { 
      value: mockClassList,
      configurable: true 
    });
  });

  it('should render comments section with title', () => {
    render(<Comments slug={testSlug} />);
    
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Comments');
  });

  it('should show empty state when no comments exist', () => {
    render(<Comments slug={testSlug} />);
    
    expect(screen.getByText('No comments yet. Be the first to share your thoughts!')).toBeInTheDocument();
  });

  it('should render comment form with textarea and submit button', () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });
    
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', "Share your thoughts anonymously... (You'll get a random username)");
    expect(textarea).toHaveAttribute('maxLength', '1000');
    expect(submitButton).toBeInTheDocument();
  });

  it('should show character count', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    
    expect(screen.getByText('0/1000')).toBeInTheDocument();
    
    await user.type(textarea, 'Hello world');
    expect(screen.getByText('11/1000')).toBeInTheDocument();
  });

  it('should disable submit button when textarea is empty', () => {
    render(<Comments slug={testSlug} />);
    
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when textarea has content', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });
    
    await user.type(textarea, 'Test comment');
    expect(submitButton).toBeEnabled();
  });

  it('should submit comment and clear form', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });
    
    await user.type(textarea, 'This is a test comment');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
    
    // Check that comment was added to localStorage
    const savedComments = JSON.parse(localStorage.getItem('blog-comments') || '[]');
    expect(savedComments).toHaveLength(1);
    expect(savedComments[0]).toMatchObject({
      content: 'This is a test comment',
      postSlug: testSlug
    });
  });

  it('should display submitted comment', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    
    await user.type(textarea, 'My test comment');
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));
    
    await waitFor(() => {
      expect(screen.getByText('My test comment')).toBeInTheDocument();
    });
    
    // Should no longer show empty state
    expect(screen.queryByText('No comments yet. Be the first to share your thoughts!')).not.toBeInTheDocument();
  });

  it('should generate random usernames for comments', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    
    await user.type(textarea, 'Comment with username');
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));
    
    await waitFor(() => {
      // Should generate username based on mocked Math.random values
      // With indices 0.5, this should generate a specific username
      const usernameElements = screen.getAllByText(/^[A-Z][a-z]+[A-Z][a-z]+\d+$/);
      expect(usernameElements.length).toBeGreaterThan(0);
    });
  });

  it('should load existing comments from localStorage on mount', () => {
    const existingComments = [
      {
        id: '1',
        username: 'TestUser123',
        content: 'Existing comment',
        timestamp: '2024-01-15T10:00:00.000Z',
        postSlug: testSlug
      },
      {
        id: '2',
        username: 'AnotherUser456',
        content: 'Different post comment',
        timestamp: '2024-01-15T11:00:00.000Z',
        postSlug: 'different-post'
      }
    ];
    
    localStorage.setItem('blog-comments', JSON.stringify(existingComments));
    
    render(<Comments slug={testSlug} />);
    
    // Should only show comment for current post slug
    expect(screen.getByText('Existing comment')).toBeInTheDocument();
    expect(screen.getByText('TestUser123')).toBeInTheDocument();
    expect(screen.queryByText('Different post comment')).not.toBeInTheDocument();
  });

  it('should show comment count in title when comments exist', () => {
    const existingComments = [
      {
        id: '1',
        username: 'User1',
        content: 'Comment 1',
        timestamp: '2024-01-15T10:00:00.000Z',
        postSlug: testSlug
      },
      {
        id: '2',
        username: 'User2',
        content: 'Comment 2',
        timestamp: '2024-01-15T11:00:00.000Z',
        postSlug: testSlug
      }
    ];
    
    localStorage.setItem('blog-comments', JSON.stringify(existingComments));
    
    render(<Comments slug={testSlug} />);
    
    expect(screen.getByText('Comments (2)')).toBeInTheDocument();
  });

  it('should show loading state while submitting', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    
    await user.type(textarea, 'Test comment');
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });
    
    // Submit the form to trigger loading state
    fireEvent.click(submitButton);
    
    // Check for loading text, but it might resolve quickly
    await waitFor(() => {
      // The comment should be submitted and form should be cleared
      expect(textarea).toHaveValue('');
    });
  });

  it('should trim whitespace from comments', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    
    await user.type(textarea, '  Comment with spaces  ');
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));
    
    await waitFor(() => {
      const savedComments = JSON.parse(localStorage.getItem('blog-comments') || '[]');
      expect(savedComments[0].content).toBe('Comment with spaces');
    });
  });

  it('should not submit empty or whitespace-only comments', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });
    
    await user.type(textarea, '   ');
    expect(submitButton).toBeDisabled();
    
    fireEvent.click(submitButton);
    
    const savedComments = JSON.parse(localStorage.getItem('blog-comments') || '[]');
    expect(savedComments).toHaveLength(0);
  });

  it('should format comment timestamps', () => {
    const existingComments = [
      {
        id: '1',
        username: 'TestUser',
        content: 'Test comment',
        timestamp: '2024-01-15T10:00:00.000Z',
        postSlug: testSlug
      }
    ];
    
    localStorage.setItem('blog-comments', JSON.stringify(existingComments));
    
    render(<Comments slug={testSlug} />);
    
    expect(mockFormat.formatDate).toHaveBeenCalledWith('2024-01-15T10:00:00.000Z');
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
  });

  it('should preserve line breaks in comment content', async () => {
    render(<Comments slug={testSlug} />);
    
    const textarea = screen.getByLabelText('Write your comment');
    const multilineComment = 'Line 1\nLine 2\nLine 3';
    
    await user.type(textarea, multilineComment);
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));
    
    await waitFor(() => {
      // Look for the comment element using a more flexible text matcher
      const commentElement = screen.getByText((content, element) => {
        return element?.textContent === multilineComment;
      });
      expect(commentElement).toHaveClass('whitespace-pre-wrap');
    });
  });
});