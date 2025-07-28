// src/components/PostBox.tsx
import Link from 'next/link';
import { Post } from '@/lib/content';
import { formatDate } from '@/lib/format';

interface PostBoxProps {
  post: Post;
  showProject?: boolean;
}

export function PostBox({ post, showProject = true }: PostBoxProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <Link 
          href={`/posts/${post.slug}`}
          className="text-xl font-semibold hover:text-accent transition-colors"
        >
          {post.meta.title}
        </Link>
        <div className="text-sm text-mid whitespace-nowrap ml-4">
          {formatDate(post.meta.date)}
          <span className="ml-2">• {post.readingTime}</span>
        </div>
      </div>
      
      <p className="text-foreground/80 mb-4">
        {post.meta.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {post.meta.tags && (
            <div className="flex gap-2">
              {post.meta.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-md"
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
            className="text-sm text-accent hover:underline"
          >
            Part of {post.meta.project} →
          </Link>
        )}
      </div>
    </div>
  );
}