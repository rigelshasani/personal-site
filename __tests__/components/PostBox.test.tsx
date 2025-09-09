/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PostBox } from '@/components/PostBox';
import { Post } from '@/lib/content';
import * as viewCounterModule from '@/lib/view-counter';
import * as formatModule from '@/lib/format';

// Mock the dependencies
jest.mock('@/lib/view-counter');
jest.mock('@/lib/format');

const mockViewCounter = viewCounterModule as jest.Mocked<typeof viewCounterModule>;
const mockFormat = formatModule as jest.Mocked<typeof formatModule>;

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function Link({ children, href, className }: any) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('PostBox Component', () => {
  const mockPost: Post = {
    slug: 'test-post',
    readingTime: '5 min read',
    meta: {
      title: 'Test Post Title',
      description: 'This is a test post description for testing purposes.',
      date: '2024-01-15',
      tags: ['react', 'testing', 'javascript', 'typescript'],
      project: 'test-project'
    },
    content: 'Mock content'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockViewCounter.getViewCount.mockReturnValue(42);
    mockViewCounter.formatViewCount.mockReturnValue('42 views');
    mockFormat.formatDate.mockReturnValue('Jan 15, 2024');
  });

  it('should render post title with correct link', () => {
    render(<PostBox post={mockPost} />);
    
    const titleLink = screen.getByRole('link', { name: 'Test Post Title' });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/posts/test-post');
    expect(titleLink).toHaveClass('text-lg', 'md:text-xl', 'font-semibold');
  });

  it('should display post description', () => {
    render(<PostBox post={mockPost} />);
    
    expect(screen.getByText('This is a test post description for testing purposes.')).toBeInTheDocument();
  });

  it('should show formatted date and reading time', () => {
    render(<PostBox post={mockPost} />);
    
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('• 5 min read')).toBeInTheDocument();
    expect(mockFormat.formatDate).toHaveBeenCalledWith('2024-01-15');
  });

  it('should display view count', () => {
    render(<PostBox post={mockPost} />);
    
    expect(screen.getByText('42 views')).toBeInTheDocument();
    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('test-post');
    expect(mockViewCounter.formatViewCount).toHaveBeenCalledWith(42);
  });

  it('should render tags up to 3 maximum', () => {
    render(<PostBox post={mockPost} />);
    
    // Should show first 3 tags only
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.queryByText('typescript')).not.toBeInTheDocument(); // 4th tag should be hidden
  });

  it('should show project link when showProject is true and project exists', () => {
    render(<PostBox post={mockPost} showProject={true} />);
    
    const projectLink = screen.getByRole('link', { name: 'Part of test-project →' });
    expect(projectLink).toBeInTheDocument();
    expect(projectLink).toHaveAttribute('href', '/projects/test-project');
  });

  it('should hide project link when showProject is false', () => {
    render(<PostBox post={mockPost} showProject={false} />);
    
    expect(screen.queryByText('Part of test-project →')).not.toBeInTheDocument();
  });

  it('should not show project link when post has no project', () => {
    const postWithoutProject = {
      ...mockPost,
      meta: { ...mockPost.meta, project: undefined }
    };

    render(<PostBox post={postWithoutProject} />);
    
    expect(screen.queryByText(/Part of .* →/)).not.toBeInTheDocument();
  });

  it('should handle posts with no tags', () => {
    const postWithoutTags = {
      ...mockPost,
      meta: { ...mockPost.meta, tags: undefined }
    };

    render(<PostBox post={postWithoutTags} />);
    
    // Should render without crashing and show other content
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });

  it('should handle posts with empty tags array', () => {
    const postWithEmptyTags = {
      ...mockPost,
      meta: { ...mockPost.meta, tags: [] }
    };

    render(<PostBox post={postWithEmptyTags} />);
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });

  it('should handle posts with fewer than 3 tags', () => {
    const postWithFewTags = {
      ...mockPost,
      meta: { ...mockPost.meta, tags: ['react', 'testing'] }
    };

    render(<PostBox post={postWithFewTags} />);
    
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
    expect(screen.queryByText('javascript')).not.toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    render(<PostBox post={mockPost} />);
    
    const container = screen.getByText('Test Post Title').closest('div').parentElement;
    expect(container).toHaveClass('border', 'border-gray-200', 'dark:border-gray-800', 'rounded-2xl');
    expect(container).toHaveClass('p-4', 'md:p-6', 'hover:shadow-lg', 'transition-shadow');
  });

  it('should show default showProject as true', () => {
    render(<PostBox post={mockPost} />);
    
    // Project link should be shown by default
    expect(screen.getByText('Part of test-project →')).toBeInTheDocument();
  });

  it('should render tag styling correctly', () => {
    render(<PostBox post={mockPost} />);
    
    const reactTag = screen.getByText('react');
    expect(reactTag).toHaveClass('px-2', 'py-1', 'text-xs', 'bg-surface', 'border');
    expect(reactTag).toHaveClass('border-border-light', 'text-foreground', 'rounded-md');
  });

  it('should handle long descriptions', () => {
    const postWithLongDescription = {
      ...mockPost,
      meta: {
        ...mockPost.meta,
        description: 'This is a very long description that should still render properly and maintain good formatting throughout the entire component without breaking the layout or causing any rendering issues.'
      }
    };

    render(<PostBox post={postWithLongDescription} />);
    
    expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
  });

  it('should have responsive design classes', () => {
    render(<PostBox post={mockPost} />);
    
    const titleLink = screen.getByText('Test Post Title');
    expect(titleLink).toHaveClass('text-lg', 'md:text-xl');
    
    const description = screen.getByText(/This is a test post description/);
    expect(description).toHaveClass('text-sm', 'md:text-base');
  });
});