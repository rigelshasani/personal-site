'use client';

import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/format';
import Link from 'next/link';

export default function AdminDashboard() {
  const posts = getAllPosts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Posts ({posts.length})
        </h1>
        <Link
          href="/admin/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Create New Post
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Posts</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {posts.map((post) => (
            <div key={post.slug} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {post.meta.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {post.meta.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400 dark:text-gray-500 mt-2">
                    <span>{formatDate(post.meta.date)}</span>
                    <span>•</span>
                    <span>{post.readingTime}</span>
                    {post.meta.tags && (
                      <>
                        <span>•</span>
                        <span>{post.meta.tags.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/edit/${post.slug}`}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete "${post.meta.title}"? This cannot be undone.`)) return;
                      try {
                        const response = await fetch(`/api/admin/posts/${post.slug}`, {
                          method: 'DELETE',
                        });
                        if (response.ok) {
                          window.location.reload();
                        } else {
                          alert('Failed to delete post');
                        }
                      } catch (error) {
                        alert('Failed to delete post');
                      }
                    }}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
              <Link
                href="/admin/create"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
              >
                Create your first post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}