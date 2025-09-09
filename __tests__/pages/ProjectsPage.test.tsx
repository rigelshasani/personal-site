/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectsPage from '@/app/projects/page';
import * as contentModule from '@/lib/content';

// Mock content functions
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

// Mock ProjectBox component
jest.mock('@/components/ProjectBox', () => ({
  ProjectBox: ({ project, showPosts }: any) => (
    <div data-testid="project-box" data-project-slug={project.slug} data-show-posts={showPosts}>
      Project: {project.meta.title} {project.meta.featured ? '(Featured)' : ''}
    </div>
  ),
}));

describe('Projects Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page header with title and description', () => {
    mockContent.getAllProjects.mockReturnValue([]);

    render(<ProjectsPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByText('Data analytics projects and technical explorations')).toBeInTheDocument();
  });

  it('should render home navigation link', () => {
    mockContent.getAllProjects.mockReturnValue([]);

    render(<ProjectsPage />);

    const homeLink = screen.getByRole('link', { name: '← Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should display empty state when no projects exist', () => {
    mockContent.getAllProjects.mockReturnValue([]);

    render(<ProjectsPage />);

    expect(screen.getByText('No projects yet. Check back soon!')).toBeInTheDocument();
  });

  it('should display featured projects section', () => {
    const mockProjects = [
      {
        slug: 'featured-project1',
        meta: {
          title: 'Featured Project 1',
          featured: true,
          date: '2024-01-01',
          description: 'A featured project',
          status: 'completed'
        },
        content: 'Featured project content',
        posts: []
      },
      {
        slug: 'featured-project2',
        meta: {
          title: 'Featured Project 2',
          featured: true,
          date: '2024-01-02',
          description: 'Another featured project',
          status: 'completed'
        },
        content: 'Featured project content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);

    render(<ProjectsPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Featured' })).toBeInTheDocument();
    
    const projectBoxes = screen.getAllByTestId('project-box');
    expect(projectBoxes).toHaveLength(2);
    expect(screen.getByText('Project: Featured Project 1 (Featured)')).toBeInTheDocument();
    expect(screen.getByText('Project: Featured Project 2 (Featured)')).toBeInTheDocument();
    
    // All project boxes should have showPosts=true
    projectBoxes.forEach(box => {
      expect(box).toHaveAttribute('data-show-posts', 'true');
    });
  });

  it('should display other projects section when featured projects exist', () => {
    const mockProjects = [
      {
        slug: 'featured-project',
        meta: {
          title: 'Featured Project',
          featured: true,
          date: '2024-01-01',
          description: 'A featured project',
          status: 'completed'
        },
        content: 'Featured project content',
        posts: []
      },
      {
        slug: 'regular-project1',
        meta: {
          title: 'Regular Project 1',
          featured: false,
          date: '2024-01-02',
          description: 'A regular project',
          status: 'in-progress'
        },
        content: 'Regular project content',
        posts: []
      },
      {
        slug: 'regular-project2',
        meta: {
          title: 'Regular Project 2',
          date: '2024-01-03',
          description: 'Another regular project',
          status: 'completed'
        },
        content: 'Regular project content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);

    render(<ProjectsPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Featured' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Other Projects' })).toBeInTheDocument();
    
    const projectBoxes = screen.getAllByTestId('project-box');
    expect(projectBoxes).toHaveLength(3);
    
    expect(screen.getByText('Project: Featured Project (Featured)')).toBeInTheDocument();
    expect(screen.getByText('Project: Regular Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project: Regular Project 2')).toBeInTheDocument();
  });

  it('should display "All Projects" heading when no featured projects exist', () => {
    const mockProjects = [
      {
        slug: 'regular-project1',
        meta: {
          title: 'Regular Project 1',
          featured: false,
          date: '2024-01-01',
          description: 'A regular project',
          status: 'completed'
        },
        content: 'Regular project content',
        posts: []
      },
      {
        slug: 'regular-project2',
        meta: {
          title: 'Regular Project 2',
          date: '2024-01-02',
          description: 'Another regular project',
          status: 'in-progress'
        },
        content: 'Regular project content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);

    render(<ProjectsPage />);

    expect(screen.queryByRole('heading', { level: 2, name: 'Featured' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'All Projects' })).toBeInTheDocument();
    
    const projectBoxes = screen.getAllByTestId('project-box');
    expect(projectBoxes).toHaveLength(2);
  });

  it('should handle projects without featured property', () => {
    const mockProjects = [
      {
        slug: 'project-no-featured',
        meta: {
          title: 'Project Without Featured',
          date: '2024-01-01',
          description: 'A project without featured property',
          status: 'completed'
        },
        content: 'Project content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);

    render(<ProjectsPage />);

    expect(screen.queryByRole('heading', { level: 2, name: 'Featured' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'All Projects' })).toBeInTheDocument();
    expect(screen.getByText('Project: Project Without Featured')).toBeInTheDocument();
  });

  it('should render correct ProjectBox components with proper props', () => {
    const mockProjects = [
      {
        slug: 'test-project',
        meta: {
          title: 'Test Project',
          featured: true,
          date: '2024-01-01',
          description: 'Test project',
          status: 'completed'
        },
        content: 'Test content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);

    render(<ProjectsPage />);

    const projectBox = screen.getByTestId('project-box');
    expect(projectBox).toHaveAttribute('data-project-slug', 'test-project');
    expect(projectBox).toHaveAttribute('data-show-posts', 'true');
  });

  it('should handle mixed featured and non-featured projects correctly', () => {
    const mockProjects = [
      {
        slug: 'featured1',
        meta: {
          title: 'Featured 1',
          featured: true,
          date: '2024-01-01',
          description: 'Featured project 1',
          status: 'completed'
        },
        content: 'Content',
        posts: []
      },
      {
        slug: 'regular1',
        meta: {
          title: 'Regular 1',
          featured: false,
          date: '2024-01-02',
          description: 'Regular project 1',
          status: 'completed'
        },
        content: 'Content',
        posts: []
      },
      {
        slug: 'featured2',
        meta: {
          title: 'Featured 2',
          featured: true,
          date: '2024-01-03',
          description: 'Featured project 2',
          status: 'completed'
        },
        content: 'Content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);

    render(<ProjectsPage />);

    // Should have both sections
    expect(screen.getByRole('heading', { level: 2, name: 'Featured' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Other Projects' })).toBeInTheDocument();
    
    // Should have all projects displayed
    expect(screen.getAllByTestId('project-box')).toHaveLength(3);
    expect(screen.getByText('Project: Featured 1 (Featured)')).toBeInTheDocument();
    expect(screen.getByText('Project: Featured 2 (Featured)')).toBeInTheDocument();
    expect(screen.getByText('Project: Regular 1')).toBeInTheDocument();
  });

  it('should not show empty state when projects exist', () => {
    const mockProjects = [
      {
        slug: 'single-project',
        meta: {
          title: 'Single Project',
          date: '2024-01-01',
          description: 'Only project',
          status: 'completed'
        },
        content: 'Content',
        posts: []
      }
    ];

    mockContent.getAllProjects.mockReturnValue(mockProjects);

    render(<ProjectsPage />);

    expect(screen.queryByText('No projects yet. Check back soon!')).not.toBeInTheDocument();
    expect(screen.getByText('Project: Single Project')).toBeInTheDocument();
  });
});