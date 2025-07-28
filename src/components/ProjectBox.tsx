// src/components/ProjectBox.tsx
import Link from 'next/link';
import { Project } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { statusColors } from '@/lib/constants';

interface ProjectBoxProps {
  project: Project;
  showPosts?: boolean;
}

export function ProjectBox({ project, showPosts = true }: ProjectBoxProps) {

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <Link 
            href={`/projects/${project.slug}`}
            className="text-lg md:text-xl font-semibold hover:text-accent transition-colors block"
          >
            {project.meta.title}
          </Link>
          <p className="text-sm text-mid mt-1">
            {formatDate(project.meta.date)}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[project.meta.status]} flex-shrink-0`}>
          {project.meta.status}
        </span>
      </div>
      
      <p className="text-sm md:text-base text-foreground/80 mb-4">
        {project.meta.description}
      </p>
      
      {project.meta.tech && project.meta.tech.length > 0 && (
        <div className="flex flex-wrap gap-1 md:gap-2 mb-4">
          {project.meta.tech.map(tech => (
            <span 
              key={tech} 
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
      
      {showPosts && project.posts.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
          <h4 className="text-sm font-medium text-mid mb-2">
            Related Posts ({project.posts.length})
          </h4>
          <div className="space-y-2">
            {project.posts.slice(0, 3).map(post => (
              <Link 
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="block text-sm hover:text-accent transition-colors"
              >
                • {post.meta.title}
              </Link>
            ))}
            {project.posts.length > 3 && (
              <Link 
                href={`/projects/${project.slug}`}
                className="text-sm text-accent hover:underline"
              >
                + {project.posts.length - 3} more posts
              </Link>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-3 mt-4">
        {project.meta.github && (
          <a 
            href={project.meta.github}
            className="text-sm text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        )}
        {project.meta.demo && (
          <a 
            href={project.meta.demo}
            className="text-sm text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
}