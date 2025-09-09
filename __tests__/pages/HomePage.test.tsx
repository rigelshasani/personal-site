/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import * as contentModule from '@/lib/content';

// Mock all content functions
jest.mock('@/lib/content');
const mockContent = contentModule as jest.Mocked<typeof contentModule>;

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

// Mock all child components
jest.mock('@/components/ProjectBox', () => ({
  ProjectBox: ({ project, showPosts }: any) => (
    <div data-testid="project-box" data-project-slug={project.slug} data-show-posts={showPosts}>
      Project: {project.meta.title}
    </div>
  ),
}));

jest.mock('@/components/PostBox', () => ({
  PostBox: ({ post }: any) => (
    <div data-testid="post-box" data-post-slug={post.slug}>
      Post: {post.meta.title}
    </div>
  ),
}));

jest.mock('@/components/FeaturedPostCard', () => ({
  FeaturedPostCard: ({ post, size }: any) => (
    <div data-testid="featured-post-card" data-post-slug={post.slug} data-size={size}>
      Featured: {post.meta.title}
    </div>
  ),
}));

jest.mock('@/components/FeaturedPostsCarousel', () => ({
  FeaturedPostsCarousel: ({ posts }: any) => (
    <div data-testid="featured-posts-carousel">
      Carousel with {posts.length} posts
    </div>
  ),
}));

jest.mock('@/components/PopularPosts', () => ({
  PopularPosts: ({ posts, showViewCounts }: any) => (
    <div data-testid="popular-posts" data-show-view-counts={showViewCounts}>
      Popular Posts: {posts.length} posts
    </div>
  ),
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render hero section with title and description', async () => {
    // Mock empty data
    mockContent.getAllProjects.mockReturnValue([]);
    mockContent.getAllPosts.mockReturnValue([]);
    mockContent.getStandalonePosts.mockReturnValue([]);

    render(await Home());

    expect(screen.getByText('Thoughts & Analytics')).toBeInTheDocument();
    expect(screen.getByText(/Personal essays and data projects/)).toBeInTheDocument();
  });

  it('should display featured posts when posts have images', async () => {
    const mockPostsWithImages = [
      {
        slug: 'post-with-image',
        meta: { 
          title: 'Post with Image', 
          images: ['image1.jpg'],
          date: '2024-01-01',
          description: 'Test post'
        },
        content: 'Content here'
      },
      {
        slug: 'post-with-markdown-image',
        meta: { 
          title: 'Post with Markdown Image',
          date: '2024-01-02',
          description: 'Test post 2'
        },
        content: 'Content with ![image](test.jpg) here'
      }
    ];

    mockContent.getAllProjects.mockReturnValue([]);
    mockContent.getAllPosts.mockReturnValue(mockPostsWithImages);
    mockContent.getStandalonePosts.mockReturnValue(mockPostsWithImages);

    render(await Home());

    expect(screen.getByText('Featured Posts')).toBeInTheDocument();
    expect(screen.getByTestId('featured-posts-carousel')).toBeInTheDocument();
    expect(screen.getByText('Carousel with 2 posts')).toBeInTheDocument();
  });

  it('should display secondary featured posts grid', async () => {
    const mockPostsWithImages = [
      {
        slug: 'post1',
        meta: { 
          title: 'Post 1', 
          images: ['image1.jpg'],
          date: '2024-01-01',
          description: 'Test post'
        },
        content: 'Content'
      },
      {
        slug: 'post2',
        meta: { 
          title: 'Post 2',
          date: '2024-01-02',
          description: 'Test post 2'
        },
        content: 'Content with <Figure src="test.jpg" />'
      },
      {
        slug: 'post3',
        meta: { 
          title: 'Post 3',
          date: '2024-01-03',
          description: 'Test post 3'
        },
        content: 'Content with ![image](test3.jpg)'
      },
      {
        slug: 'post4',
        meta: { 
          title: 'Post 4',
          date: '2024-01-04',
          description: 'Test post 4'
        },
        content: 'Content with ![image](test4.jpg)'
      }
    ];

    mockContent.getAllProjects.mockReturnValue([]);
    mockContent.getAllPosts.mockReturnValue(mockPostsWithImages);
    mockContent.getStandalonePosts.mockReturnValue(mockPostsWithImages);

    render(await Home());

    // Should show 3 featured post cards (slice(1, 4) from 4 posts = posts 2, 3, 4)
    const featuredCards = screen.getAllByTestId('featured-post-card');
    expect(featuredCards).toHaveLength(3);
    expect(featuredCards[0]).toHaveAttribute('data-size', 'medium');
  });

  it('should display featured projects when they exist', async () => {
    const mockProjects = [
      {
        slug: 'featured-project',
        meta: { 
          title: 'Featured Project',
          featured: true,
          date: '2024-01-01',
          description: 'Featured project'
        },
        content: 'Project content',
        posts: []
      },
      {
        slug: 'regular-project',
        meta: { 
          title: 'Regular Project',
          date: '2024-01-02',
          description: 'Regular project'
        },
        content: 'Project content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);
    mockContent.getAllPosts.mockReturnValue([]);
    mockContent.getStandalonePosts.mockReturnValue([]);

    render(await Home());

    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
    
    const projectBoxes = screen.getAllByTestId('project-box');
    // Should have 1 in featured section + 2 in recent section (first 3 total)
    expect(projectBoxes).toHaveLength(3);
    expect(screen.getAllByText('Project: Featured Project')).toHaveLength(2); // Appears twice: featured + recent
  });

  it('should display recent projects with "View all" link', async () => {
    const mockProjects = [
      {
        slug: 'project1',
        meta: { 
          title: 'Project 1',
          date: '2024-01-01',
          description: 'Project 1'
        },
        content: 'Content',
        posts: []
      },
      {
        slug: 'project2',
        meta: { 
          title: 'Project 2',
          date: '2024-01-02',
          description: 'Project 2'
        },
        content: 'Content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);
    mockContent.getAllPosts.mockReturnValue([]);
    mockContent.getStandalonePosts.mockReturnValue([]);

    render(await Home());

    expect(screen.getByText('Latest Projects')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all →' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all →' })).toHaveAttribute('href', '/projects');
    
    const projectBoxes = screen.getAllByTestId('project-box');
    expect(projectBoxes).toHaveLength(2);
    expect(projectBoxes[0]).toHaveAttribute('data-show-posts', 'true');
  });

  it('should display regular posts when they exist', async () => {
    const mockRegularPosts = [
      {
        slug: 'regular-post1',
        meta: { 
          title: 'Regular Post 1',
          date: '2024-01-01',
          description: 'Regular post'
        },
        content: 'No images here'
      },
      {
        slug: 'regular-post2',
        meta: { 
          title: 'Regular Post 2',
          date: '2024-01-02',
          description: 'Another regular post'
        },
        content: 'Also no images'
      }
    ];

    mockContent.getAllProjects.mockReturnValue([]);
    mockContent.getAllPosts.mockReturnValue(mockRegularPosts);
    mockContent.getStandalonePosts.mockReturnValue(mockRegularPosts);

    render(await Home());

    expect(screen.getByText('Latest Posts')).toBeInTheDocument();
    
    // Find the posts "View all" link specifically
    const viewAllLinks = screen.getAllByRole('link', { name: 'View all →' });
    const postsViewAllLink = viewAllLinks.find(link => link.getAttribute('href') === '/posts');
    expect(postsViewAllLink).toBeDefined();
    
    const postBoxes = screen.getAllByTestId('post-box');
    expect(postBoxes).toHaveLength(2);
  });

  it('should display popular posts section', async () => {
    const mockPosts = [
      {
        slug: 'post1',
        meta: { 
          title: 'Post 1',
          date: '2024-01-01',
          description: 'Test post'
        },
        content: 'Content'
      }
    ];

    mockContent.getAllProjects.mockReturnValue([]);
    mockContent.getAllPosts.mockReturnValue(mockPosts);
    mockContent.getStandalonePosts.mockReturnValue([]);

    render(await Home());

    const popularPosts = screen.getByTestId('popular-posts');
    expect(popularPosts).toBeInTheDocument();
    expect(popularPosts).toHaveAttribute('data-show-view-counts', 'true');
    expect(screen.getByText('Popular Posts: 1 posts')).toBeInTheDocument();
  });

  it('should correctly filter posts with images vs regular posts', async () => {
    const mockPostsWithImages = [
      {
        slug: 'post-with-frontmatter-image',
        meta: { 
          title: 'Post with Frontmatter Image',
          images: ['image1.jpg'],
          date: '2024-01-01',
          description: 'Test post'
        },
        content: 'Content'
      }
    ];

    const mockRegularPosts = [
      {
        slug: 'regular-post',
        meta: { 
          title: 'Regular Post',
          date: '2024-01-02',
          description: 'Regular post'
        },
        content: 'No images'
      }
    ];

    const allPosts = [...mockPostsWithImages, ...mockRegularPosts];

    mockContent.getAllProjects.mockReturnValue([]);
    mockContent.getAllPosts.mockReturnValue(allPosts);
    mockContent.getStandalonePosts.mockReturnValue(allPosts);

    render(await Home());

    // Should show featured posts section
    expect(screen.getByText('Featured Posts')).toBeInTheDocument();
    
    // Should show latest posts section  
    expect(screen.getByText('Latest Posts')).toBeInTheDocument();
    
    // Featured carousel should have 1 post
    expect(screen.getByText('Carousel with 1 posts')).toBeInTheDocument();
    
    // Latest posts should have 1 post
    expect(screen.getAllByTestId('post-box')).toHaveLength(1);
  });

  it('should limit recent projects to 3 items', async () => {
    const mockProjects = Array.from({ length: 5 }, (_, i) => ({
      slug: `project${i + 1}`,
      meta: { 
        title: `Project ${i + 1}`,
        date: `2024-01-0${i + 1}`,
        description: `Project ${i + 1}`
      },
      content: 'Content',
      posts: []
    }));

    mockContent.getAllProjects.mockReturnValue(mockProjects);
    mockContent.getAllPosts.mockReturnValue([]);
    mockContent.getStandalonePosts.mockReturnValue([]);

    render(await Home());

    const projectBoxes = screen.getAllByTestId('project-box');
    expect(projectBoxes).toHaveLength(3);
  });

  it('should limit regular posts to 5 items', async () => {
    const mockRegularPosts = Array.from({ length: 8 }, (_, i) => ({
      slug: `post${i + 1}`,
      meta: { 
        title: `Post ${i + 1}`,
        date: `2024-01-0${i + 1}`,
        description: `Post ${i + 1}`
      },
      content: 'No images'
    }));

    mockContent.getAllProjects.mockReturnValue([]);
    mockContent.getAllPosts.mockReturnValue(mockRegularPosts);
    mockContent.getStandalonePosts.mockReturnValue(mockRegularPosts);

    render(await Home());

    const postBoxes = screen.getAllByTestId('post-box');
    expect(postBoxes).toHaveLength(5);
  });

  it('should hide sections when no content is available', async () => {
    mockContent.getAllProjects.mockReturnValue([]);
    mockContent.getAllPosts.mockReturnValue([]);
    mockContent.getStandalonePosts.mockReturnValue([]);

    render(await Home());

    // Hero should always be present
    expect(screen.getByText('Thoughts & Analytics')).toBeInTheDocument();
    
    // Other sections should be hidden
    expect(screen.queryByText('Featured Posts')).not.toBeInTheDocument();
    expect(screen.queryByText('Featured Projects')).not.toBeInTheDocument();
    expect(screen.queryByText('Latest Posts')).not.toBeInTheDocument();
    
    // But Latest Projects should still show (empty)
    expect(screen.getByText('Latest Projects')).toBeInTheDocument();
    
    // Popular posts should still show (even if empty)
    expect(screen.getByTestId('popular-posts')).toBeInTheDocument();
  });
});