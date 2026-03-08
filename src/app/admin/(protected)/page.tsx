'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/format';
import Link from 'next/link';
import { Post } from '@/lib/content';
import { useToast } from '@/components/Toast';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // Fetch posts on client side to avoid hydration issues
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/admin/posts/list');
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-mid">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          Posts ({posts.length})
        </h1>
        <Link
          href="/admin/create"
          className="bg-accent hover:opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium transition-opacity"
        >
          Create New Post
        </Link>
      </div>

      <div className="border border-border-light rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light bg-surface">
          <h2 className="text-lg font-medium text-foreground">All Posts</h2>
        </div>
        <div className="divide-y divide-border-light">
          {posts.map((post) => (
            <div key={post.slug} className="px-6 py-4 hover:bg-surface transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {post.meta.title}
                  </h3>
                  <p className="text-sm text-mid truncate">
                    {post.meta.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-mid mt-2">
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
                    className="text-accent hover:underline text-sm font-medium"
                  >
                    View ↗
                  </Link>
                  <Link
                    href={`/admin/edit/${post.slug}`}
                    className="text-mid hover:text-foreground text-sm font-medium"
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
                          setPosts((prev) => prev.filter((p) => p.slug !== post.slug));
                        } else {
                          toast.error('Failed to delete post');
                        }
                      } catch {
                        toast.error('Failed to delete post');
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-mid">No posts yet.</p>
              <Link
                href="/admin/create"
                className="text-accent hover:underline text-sm font-medium mt-2 inline-block"
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
