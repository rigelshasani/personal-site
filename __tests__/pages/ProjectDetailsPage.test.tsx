/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import ProjectPage, { generateStaticParams, generateMetadata } from '@/app/projects/[slug]/page';
import * as contentModule from '@/lib/content';
import * as formatModule from '@/lib/format';

// Mock content functions
jest.mock('@/lib/content');
const mockContent = contentModule as jest.Mocked<typeof contentModule>;

// Mock format functions
jest.mock('@/lib/format');
const mockFormat = formatModule as jest.Mocked<typeof formatModule>;

// Mock Next.js functions
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;

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

// Mock MDXRemote
jest.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: any) => <div data-testid="mdx-content">{source}</div>,
}));

// Mock PostBox component
jest.mock('@/components/PostBox', () => ({
  PostBox: ({ post, showProject }: any) => (
    <div data-testid="post-box" data-post-slug={post.slug} data-show-project={showProject}>
      Post: {post.meta.title}
    </div>
  ),
}));

// Mock Figure component
jest.mock('@/components/mdx/Figure', () => ({
  Figure: ({ src }: any) => <div data-testid="figure">Figure: {src}</div>,
}));

// Mock constants
jest.mock('@/lib/constants', () => ({
  statusColors: {
    'completed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'planned': 'bg-blue-100 text-blue-800',
  },
}));

describe('Project Details Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormat.formatDate.mockImplementation((date) => `Formatted: ${date}`);
  });

  describe('generateStaticParams', () => {
    it('should return static params for all projects', async () => {
      const mockProjects = [
        { slug: 'project1', meta: {}, content: '', posts: [] },
        { slug: 'project2', meta: {}, content: '', posts: [] },
      ];
      
      mockContent.getAllProjects.mockReturnValue(mockProjects);

      const result = await generateStaticParams();

      expect(result).toEqual([
        { slug: 'project1' },
        { slug: 'project2' },
      ]);
      expect(mockContent.getAllProjects).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no projects exist', async () => {
      mockContent.getAllProjects.mockReturnValue([]);

      const result = await generateStaticParams();

      expect(result).toEqual([]);
    });
  });

  describe('generateMetadata', () => {
    it('should generate metadata for existing project', async () => {
      const mockProject = {
        slug: 'test-project',
        meta: {
          title: 'Test Project',
          description: 'A test project description',
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'test-project' });
      const result = await generateMetadata({ params });

      expect(result).toEqual({
        title: 'Test Project',
        description: 'A test project description',
        openGraph: {
          type: 'article',
          title: 'Test Project',
          description: 'A test project description',
        },
        twitter: {
          card: 'summary',
          title: 'Test Project',
          description: 'A test project description',
        },
      });
      expect(mockContent.getProject).toHaveBeenCalledWith('test-project');
    });

    it('should return not found metadata for non-existent project', async () => {
      mockContent.getProject.mockReturnValue(null);

      const params = Promise.resolve({ slug: 'non-existent' });
      const result = await generateMetadata({ params });

      expect(result).toEqual({ title: 'Project Not Found' });
      expect(mockContent.getProject).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('ProjectPage component', () => {
    it('should call notFound for non-existent project', async () => {
      mockContent.getProject.mockReturnValue(null);
      mockNotFound.mockImplementation(() => {
        throw new Error('Not found'); // Simulate Next.js notFound behavior
      });

      const params = Promise.resolve({ slug: 'non-existent' });
      
      await expect(ProjectPage({ params })).rejects.toThrow('Not found');
      expect(mockContent.getProject).toHaveBeenCalledWith('non-existent');
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });

    it('should render project header with title, status, and description', async () => {
      const mockProject = {
        slug: 'test-project',
        meta: {
          title: 'Test Project',
          description: 'A comprehensive test project',
          date: '2024-01-15',
          status: 'completed',
        },
        content: 'Project content here',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'test-project' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.getByRole('heading', { level: 1, name: 'Test Project' })).toBeInTheDocument();
      expect(screen.getByText('A comprehensive test project')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('Formatted: 2024-01-15')).toBeInTheDocument();
    });

    it('should render back navigation link', async () => {
      const mockProject = {
        slug: 'test-project',
        meta: {
          title: 'Test Project',
          description: 'Test description',
          date: '2024-01-01',
          status: 'completed',
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'test-project' });
      const component = await ProjectPage({ params });
      render(component);

      const backLink = screen.getByRole('link', { name: '← All Projects' });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/projects');
    });

    it('should display post count when posts exist', async () => {
      const mockProject = {
        slug: 'project-with-posts',
        meta: {
          title: 'Project with Posts',
          description: 'A project with posts',
          date: '2024-01-01',
          status: 'completed',
        },
        content: 'Content',
        posts: [
          { slug: 'post1', meta: { title: 'Post 1', date: '2024-01-01' }, content: 'Content 1' },
          { slug: 'post2', meta: { title: 'Post 2', date: '2024-01-02' }, content: 'Content 2' },
          { slug: 'post3', meta: { title: 'Post 3', date: '2024-01-03' }, content: 'Content 3' },
        ]
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'project-with-posts' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.getByText('• 3 posts')).toBeInTheDocument();
    });

    it('should display singular post count correctly', async () => {
      const mockProject = {
        slug: 'project-one-post',
        meta: {
          title: 'Project with One Post',
          description: 'A project with one post',
          date: '2024-01-01',
          status: 'completed',
        },
        content: 'Content',
        posts: [
          { slug: 'post1', meta: { title: 'Post 1', date: '2024-01-01' }, content: 'Content 1' },
        ]
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'project-one-post' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.getByText('• 1 post')).toBeInTheDocument();
    });

    it('should not display post count when no posts exist', async () => {
      const mockProject = {
        slug: 'project-no-posts',
        meta: {
          title: 'Project without Posts',
          description: 'A project without posts',
          date: '2024-01-01',
          status: 'completed',
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'project-no-posts' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.queryByText(/• \d+ posts?/)).not.toBeInTheDocument();
    });

    it('should display tech stack when provided', async () => {
      const mockProject = {
        slug: 'tech-project',
        meta: {
          title: 'Tech Project',
          description: 'A project with tech stack',
          date: '2024-01-01',
          status: 'completed',
          tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'tech-project' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    });

    it('should not display tech stack when not provided', async () => {
      const mockProject = {
        slug: 'no-tech-project',
        meta: {
          title: 'Project without Tech',
          description: 'A project without tech stack',
          date: '2024-01-01',
          status: 'completed',
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'no-tech-project' });
      const component = await ProjectPage({ params });
      render(component);

      // No tech stack elements should be present
      const techElements = screen.queryAllByText(/React|TypeScript|Node\.js|PostgreSQL/);
      expect(techElements).toHaveLength(0);
    });

    it('should display GitHub and demo links when provided', async () => {
      const mockProject = {
        slug: 'linked-project',
        meta: {
          title: 'Linked Project',
          description: 'A project with links',
          date: '2024-01-01',
          status: 'completed',
          github: 'https://github.com/user/repo',
          demo: 'https://demo.example.com',
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'linked-project' });
      const component = await ProjectPage({ params });
      render(component);

      const githubLink = screen.getByRole('link', { name: 'View on GitHub →' });
      const demoLink = screen.getByRole('link', { name: 'Live Demo →' });

      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('href', 'https://github.com/user/repo');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

      expect(demoLink).toBeInTheDocument();
      expect(demoLink).toHaveAttribute('href', 'https://demo.example.com');
      expect(demoLink).toHaveAttribute('target', '_blank');
      expect(demoLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should display only GitHub link when demo is not provided', async () => {
      const mockProject = {
        slug: 'github-only-project',
        meta: {
          title: 'GitHub Only Project',
          description: 'A project with only GitHub link',
          date: '2024-01-01',
          status: 'completed',
          github: 'https://github.com/user/repo',
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'github-only-project' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.getByRole('link', { name: 'View on GitHub →' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Live Demo →' })).not.toBeInTheDocument();
    });

    it('should render project content with MDXRemote', async () => {
      const mockProject = {
        slug: 'content-project',
        meta: {
          title: 'Content Project',
          description: 'A project with rich content',
          date: '2024-01-01',
          status: 'completed',
        },
        content: '# Project Content\n\nThis is the project content with **bold** text.',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'content-project' });
      const component = await ProjectPage({ params });
      render(component);

      const mdxContent = screen.getByTestId('mdx-content');
      expect(mdxContent).toBeInTheDocument();
      expect(mdxContent).toHaveTextContent('# Project Content This is the project content with **bold** text.');
    });

    it('should display related posts section when posts exist', async () => {
      const mockProject = {
        slug: 'project-with-posts',
        meta: {
          title: 'Project with Posts',
          description: 'A project with posts',
          date: '2024-01-01',
          status: 'completed',
        },
        content: 'Content',
        posts: [
          { slug: 'post1', meta: { title: 'Post 1', date: '2024-01-01' }, content: 'Content 1' },
          { slug: 'post2', meta: { title: 'Post 2', date: '2024-01-02' }, content: 'Content 2' },
        ]
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'project-with-posts' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.getByRole('heading', { level: 2, name: 'Posts in this Series (2)' })).toBeInTheDocument();
      
      const postBoxes = screen.getAllByTestId('post-box');
      expect(postBoxes).toHaveLength(2);
      expect(postBoxes[0]).toHaveAttribute('data-show-project', 'false');
      expect(postBoxes[1]).toHaveAttribute('data-show-project', 'false');
      
      expect(screen.getByText('Post: Post 1')).toBeInTheDocument();
      expect(screen.getByText('Post: Post 2')).toBeInTheDocument();
    });

    it('should not display related posts section when no posts exist', async () => {
      const mockProject = {
        slug: 'project-no-posts',
        meta: {
          title: 'Project without Posts',
          description: 'A project without posts',
          date: '2024-01-01',
          status: 'completed',
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'project-no-posts' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.queryByRole('heading', { level: 2, name: /Posts in this Series/ })).not.toBeInTheDocument();
      expect(screen.queryByTestId('post-box')).not.toBeInTheDocument();
    });

    it('should handle different project statuses correctly', async () => {
      const mockProject = {
        slug: 'in-progress-project',
        meta: {
          title: 'In Progress Project',
          description: 'A project in progress',
          date: '2024-01-01',
          status: 'in-progress',
        },
        content: 'Content',
        posts: []
      };

      mockContent.getProject.mockReturnValue(mockProject);

      const params = Promise.resolve({ slug: 'in-progress-project' });
      const component = await ProjectPage({ params });
      render(component);

      expect(screen.getByText('in-progress')).toBeInTheDocument();
    });
  });
});