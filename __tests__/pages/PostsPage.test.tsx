/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import PostsPage from '@/app/posts/page';
import * as contentModule from '@/lib/content';

// Mock content functions
jest.mock('@/lib/content');
const mockContent = contentModule as jest.Mocked<typeof contentModule>;

// Mock PostBox component
jest.mock('@/components/PostBox', () => ({
  PostBox: ({ post }: any) => (
    <div data-testid="post-box" data-post-slug={post.slug} data-post-tags={post.meta.tags?.join(',')}>
      Post: {post.meta.title}
    </div>
  ),
}));

describe('Posts Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page header with title and description', () => {
    mockContent.getAllPosts.mockReturnValue([]);

    render(<PostsPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'All Posts' })).toBeInTheDocument();
    expect(screen.getByText('Essays, thoughts, and technical writing')).toBeInTheDocument();
  });

  it('should display empty state when no posts exist', () => {
    mockContent.getAllPosts.mockReturnValue([]);

    render(<PostsPage />);

    expect(screen.getByText('No posts yet. Check back soon!')).toBeInTheDocument();
  });

  it('should categorize and display philosophy posts', () => {
    const mockPosts = [
      {
        slug: 'philosophy-post1',
        meta: {
          title: 'Philosophy Post 1',
          tags: ['philosophy', 'deep-thoughts'],
          date: '2024-01-01',
          description: 'A philosophical post'
        },
        content: 'Philosophy content'
      },
      {
        slug: 'thoughts-post',
        meta: {
          title: 'Thoughts Post',
          tags: ['thoughts'],
          date: '2024-01-02',
          description: 'A thoughts post'
        },
        content: 'Thoughts content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Philosophy & Thoughts' })).toBeInTheDocument();
    
    const postBoxes = screen.getAllByTestId('post-box');
    const philosophyBoxes = postBoxes.filter(box => 
      box.getAttribute('data-post-tags')?.includes('philosophy') || 
      box.getAttribute('data-post-tags')?.includes('thoughts')
    );
    
    expect(philosophyBoxes).toHaveLength(2);
    expect(screen.getByText('Post: Philosophy Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post: Thoughts Post')).toBeInTheDocument();
  });

  it('should categorize and display tech posts', () => {
    const mockPosts = [
      {
        slug: 'tech-post1',
        meta: {
          title: 'Tech Post 1',
          tags: ['tech', 'javascript'],
          date: '2024-01-01',
          description: 'A tech post'
        },
        content: 'Tech content'
      },
      {
        slug: 'programming-post',
        meta: {
          title: 'Programming Post',
          tags: ['programming'],
          date: '2024-01-02',
          description: 'A programming post'
        },
        content: 'Programming content'
      },
      {
        slug: 'tutorial-post',
        meta: {
          title: 'Tutorial Post',
          tags: ['tutorial', 'how-to'],
          date: '2024-01-03',
          description: 'A tutorial post'
        },
        content: 'Tutorial content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Tech & Programming' })).toBeInTheDocument();
    
    expect(screen.getByText('Post: Tech Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post: Programming Post')).toBeInTheDocument();
    expect(screen.getByText('Post: Tutorial Post')).toBeInTheDocument();
  });

  it('should categorize and display analytics posts', () => {
    const mockPosts = [
      {
        slug: 'analytics-post1',
        meta: {
          title: 'Analytics Post 1',
          tags: ['analytics', 'data'],
          date: '2024-01-01',
          description: 'An analytics post'
        },
        content: 'Analytics content'
      },
      {
        slug: 'analytics-post2',
        meta: {
          title: 'Analytics Post 2',
          tags: ['analytics'],
          date: '2024-01-02',
          description: 'Another analytics post'
        },
        content: 'More analytics content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Data Analytics' })).toBeInTheDocument();
    
    expect(screen.getByText('Post: Analytics Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post: Analytics Post 2')).toBeInTheDocument();
  });

  it('should categorize and display other posts', () => {
    const mockPosts = [
      {
        slug: 'random-post1',
        meta: {
          title: 'Random Post 1',
          tags: ['random', 'misc'],
          date: '2024-01-01',
          description: 'A random post'
        },
        content: 'Random content'
      },
      {
        slug: 'untagged-post',
        meta: {
          title: 'Untagged Post',
          date: '2024-01-02',
          description: 'A post without tags'
        },
        content: 'Untagged content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Other Posts' })).toBeInTheDocument();
    
    expect(screen.getByText('Post: Random Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post: Untagged Post')).toBeInTheDocument();
  });

  it('should handle posts with multiple relevant tags correctly', () => {
    const mockPosts = [
      {
        slug: 'multi-tag-post',
        meta: {
          title: 'Multi Tag Post',
          tags: ['tech', 'philosophy', 'analytics'], // Will appear in all relevant sections
          date: '2024-01-01',
          description: 'A post with multiple relevant tags'
        },
        content: 'Multi content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    // Should appear in all relevant sections
    expect(screen.getByRole('heading', { level: 2, name: 'Philosophy & Thoughts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Tech & Programming' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Data Analytics' })).toBeInTheDocument();
    
    // Should appear 3 times (once in each section)
    expect(screen.getAllByText('Post: Multi Tag Post')).toHaveLength(3);
  });

  it('should display all categories when posts exist for each', () => {
    const mockPosts = [
      {
        slug: 'philosophy-post',
        meta: {
          title: 'Philosophy Post',
          tags: ['philosophy'],
          date: '2024-01-01',
          description: 'Philosophy post'
        },
        content: 'Philosophy content'
      },
      {
        slug: 'tech-post',
        meta: {
          title: 'Tech Post',
          tags: ['tech'],
          date: '2024-01-02',
          description: 'Tech post'
        },
        content: 'Tech content'
      },
      {
        slug: 'analytics-post',
        meta: {
          title: 'Analytics Post',
          tags: ['analytics'],
          date: '2024-01-03',
          description: 'Analytics post'
        },
        content: 'Analytics content'
      },
      {
        slug: 'other-post',
        meta: {
          title: 'Other Post',
          tags: ['random'],
          date: '2024-01-04',
          description: 'Other post'
        },
        content: 'Other content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Philosophy & Thoughts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Tech & Programming' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Data Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Other Posts' })).toBeInTheDocument();
    
    expect(screen.getAllByTestId('post-box')).toHaveLength(4);
  });

  it('should hide categories that have no posts', () => {
    const mockPosts = [
      {
        slug: 'tech-post',
        meta: {
          title: 'Tech Post',
          tags: ['tech'],
          date: '2024-01-01',
          description: 'Tech post'
        },
        content: 'Tech content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    // Should only show tech section
    expect(screen.getByRole('heading', { level: 2, name: 'Tech & Programming' })).toBeInTheDocument();
    
    // Other sections should not be present
    expect(screen.queryByRole('heading', { level: 2, name: 'Philosophy & Thoughts' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Data Analytics' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Other Posts' })).not.toBeInTheDocument();
    
    // Should not show empty state
    expect(screen.queryByText('No posts yet. Check back soon!')).not.toBeInTheDocument();
  });

  it('should handle posts without tags', () => {
    const mockPosts = [
      {
        slug: 'no-tags-post1',
        meta: {
          title: 'No Tags Post 1',
          date: '2024-01-01',
          description: 'Post without tags'
        },
        content: 'No tags content'
      },
      {
        slug: 'no-tags-post2',
        meta: {
          title: 'No Tags Post 2',
          tags: [], // Empty tags array
          date: '2024-01-02',
          description: 'Post with empty tags'
        },
        content: 'Empty tags content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Other Posts' })).toBeInTheDocument();
    expect(screen.getByText('Post: No Tags Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post: No Tags Post 2')).toBeInTheDocument();
  });

  it('should render correct PostBox components with proper props', () => {
    const mockPosts = [
      {
        slug: 'test-post',
        meta: {
          title: 'Test Post',
          tags: ['tech'],
          date: '2024-01-01',
          description: 'Test post'
        },
        content: 'Test content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    const postBox = screen.getByTestId('post-box');
    expect(postBox).toHaveAttribute('data-post-slug', 'test-post');
    expect(postBox).toHaveAttribute('data-post-tags', 'tech');
  });

  it('should handle case-sensitive tag matching correctly', () => {
    const mockPosts = [
      {
        slug: 'case-test-post',
        meta: {
          title: 'Case Test Post',
          tags: ['Tech', 'Philosophy', 'ANALYTICS'], // Mixed case
          date: '2024-01-01',
          description: 'Case test post'
        },
        content: 'Case test content'
      }
    ];

    mockContent.getAllPosts.mockReturnValue(mockPosts);

    render(<PostsPage />);

    // Should only appear in Other Posts since tags are case-sensitive
    expect(screen.getByRole('heading', { level: 2, name: 'Other Posts' })).toBeInTheDocument();
    expect(screen.getByText('Post: Case Test Post')).toBeInTheDocument();
    
    // Should not appear in other categories
    expect(screen.queryByRole('heading', { level: 2, name: 'Tech & Programming' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Philosophy & Thoughts' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Data Analytics' })).not.toBeInTheDocument();
  });
});