// src/components/PostBox.tsx
import Link from 'next/link';
import { Post } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { ViewCount } from '@/components/ViewCounter';

interface PostBoxProps {
  post: Post;
  showProject?: boolean;
}

export function PostBox({ post, showProject = true }: PostBoxProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
        <Link 
          href={`/posts/${post.slug}`}
          className="text-lg md:text-xl font-semibold hover:text-accent transition-colors flex-1 min-w-0"
        >
          {post.meta.title}
        </Link>
        <div className="text-sm text-mid whitespace-nowrap sm:ml-4 flex-shrink-0 flex items-center gap-2">
          <span>{formatDate(post.meta.date)}</span>
          <span>• {post.readingTime}</span>
          <ViewCount slug={post.slug} />
        </div>
      </div>
      
      <p className="text-sm md:text-base text-foreground/80 mb-4">
        {post.meta.description}
      </p>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center gap-4">
          {post.meta.tags && (
            <div className="flex flex-wrap gap-1 md:gap-2">
              {post.meta.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 text-xs bg-surface border border-border-light text-foreground rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {showProject && post.meta.project && (
          <Link 
            href={`/projects/${post.meta.project}`}
            className="text-sm text-accent hover:underline flex-shrink-0"
          >
            Part of {post.meta.project} →
          </Link>
        )}
      </div>
    </div>
  );
}