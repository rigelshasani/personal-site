// src/components/PopularPosts.tsx - Display popular posts based on view counts
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPopularPosts, formatViewCount } from '@/lib/view-counter';
import { formatDate } from '@/lib/format';

interface PopularPost {
  slug: string;
  title: string;
  date: string;
  views: number;
}

interface PopularPostsProps {
  posts: PopularPost[]; // Receive posts data from server
  showViewCounts?: boolean;
  className?: string;
}

export function PopularPosts({ 
  posts,
  showViewCounts = true, 
  className = "" 
}: PopularPostsProps) {
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPopularPosts = () => {
      try {
        // Get view counts from localStorage
        const viewData = getPopularPosts(posts.length);
        
        if (viewData.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Combine view data with post metadata from props
        const postsWithViews = viewData
          .map(({ slug, views }) => {
            const post = posts.find(p => p.slug === slug);
            if (!post) return null;
            
            return {
              slug: post.slug,
              title: post.title,
              date: post.date,
              views
            };
          })
          .filter((post): post is PopularPost => post !== null);
        
        setPopularPosts(postsWithViews);
      } catch (error) {
        console.warn('Could not load popular posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularPosts();

    // Listen for storage changes to update popular posts in real-time
    const handleStorageChange = () => {
      loadPopularPosts();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [posts]);

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (popularPosts.length === 0) {
    return null; // Don't show section if no popular posts
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Popular Posts
      </h3>
      
      <div className="space-y-3">
        {popularPosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="block group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-3 -m-3 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-orange-500 bg-orange-100 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                    #{index + 1}
                  </span>
                  {showViewCounts && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatViewCount(post.views)}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-sm group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(post.date)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}