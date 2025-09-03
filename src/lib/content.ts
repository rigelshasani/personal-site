// src/lib/content.ts - Enhanced with project relationships

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cacheContent, devLog, validateFrontmatter, watchContentChanges } from './dev-utils';

// Initialize content watching in development
if (process.env.NODE_ENV === 'development') {
  watchContentChanges();
}

const contentDirectory = path.join(process.cwd(), 'src/content');

export interface PostMeta {
  title: string;
  date: string;
  description: string;
  readingTime?: string; // Optional manual override
  tags?: string[];
  project?: string; // Links post to a project
  order?: number;   // Order within project
  images?: string[]; // Array of image URLs
}

export interface ProjectMeta {
  title: string;
  description: string;
  date: string;
  status: 'active' | 'completed' | 'archived';
  tech?: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
}

export interface Post {
  slug: string;
  meta: PostMeta;
  content: string;
  readingTime: string; // Auto-calculated
}

export interface Project {
  slug: string;
  meta: ProjectMeta;
  content: string;
  posts: Post[]; // Related posts
}

// Calculate reading time
function calculateReadingTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 225));
  return `${minutes} min`;
}

// Get all posts
export function getAllPosts(): Post[] {
  return cacheContent('all-posts', () => {
    devLog('Loading all posts...');
    
    const postsDirectory = path.join(contentDirectory, 'posts');
    const filenames = fs.readdirSync(postsDirectory);
    
    const posts = filenames
      .filter(name => name.endsWith('.mdx'))
      .map(filename => {
        const slug = filename.replace('.mdx', '');
        const fullPath = path.join(postsDirectory, filename);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        // Validate frontmatter in development
        validateFrontmatter(data, filename);
        
        return {
          slug,
          meta: data as PostMeta,
          content,
          readingTime: data.readingTime || calculateReadingTime(content),
        };
      })
      .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
      
    devLog(`Loaded ${posts.length} posts`);
    return posts;
  });
}

// Get all projects with their related posts
export function getAllProjects(): Project[] {
  return cacheContent('all-projects', () => {
    devLog('Loading all projects...');
    
    const projectsDirectory = path.join(contentDirectory, 'projects');
    const filenames = fs.readdirSync(projectsDirectory);
    const allPosts = getAllPosts();
    
    const projects = filenames
      .filter(name => name.endsWith('.mdx'))
      .map(filename => {
        const slug = filename.replace('.mdx', '');
        const fullPath = path.join(projectsDirectory, filename);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        // Validate frontmatter in development
        validateFrontmatter(data, filename);
        
        // Find posts related to this project
        const relatedPosts = allPosts
          .filter(post => post.meta.project === slug)
          .sort((a, b) => (a.meta.order || 0) - (b.meta.order || 0));
        
        return {
          slug,
          meta: data as ProjectMeta,
          content,
          posts: relatedPosts,
        };
      })
      .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
      
    devLog(`Loaded ${projects.length} projects`);
    return projects;
  });
}

// Get posts that don't belong to any project
export function getStandalonePosts(): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => !post.meta.project);
}

// Get a specific project with its posts
export function getProject(slug: string): Project | null {
  const projects = getAllProjects();
  return projects.find(project => project.slug === slug) || null;
}

// Get a specific post
export function getPost(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug) || null;
}