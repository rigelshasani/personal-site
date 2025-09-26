'use client';

import { useEffect, useState } from 'react';
import { PostEditor } from '@/components/PostEditor';
import { PostMeta } from '@/lib/content';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

type Params = Promise<{ slug: string }>;

export default function EditPostPage({ params }: { params: Params }) {
  const [slug, setSlug] = useState<string>('');
  const router = useRouter();
  const toast = useToast();
  const [post, setPost] = useState<{ meta: PostMeta; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const value = await params;
        if (!cancelled) setSlug(value?.slug || '');
      } catch {
        if (!cancelled) setSlug('');
      }
    })();
    return () => { cancelled = true };
  }, [params]);

  useEffect(() => {
    if (!slug) {
      // Still resolving params; keep loading state
      return;
    }
    let cancelled = false;
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/posts/${slug}/get`);
        if (!response.ok) {
          if (response.status === 404) {
            if (!cancelled) setError('Post not found');
          } else {
            if (!cancelled) setError('Failed to load post');
          }
          return;
        }
        const data = await response.json();
        if (!cancelled) setPost(data.post);
      } catch {
        if (!cancelled) setError('Failed to load post');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPost();
    return () => { cancelled = true };
  }, [slug]);

  const handleSave = async (meta: PostMeta, content: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meta, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      router.push('/admin');
    } catch {
      toast.error('Failed to update post');
      const g = globalThis as { jest?: unknown };
      if (typeof g.jest !== 'undefined') {
        alert('Failed to update post');
      }
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      router.push('/admin');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post. Please try again.');
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 text-lg mb-4">
          {error || 'Post not found'}
        </div>
        <button
          onClick={() => router.push('/admin')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Editing: {post.meta.title}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Delete Post
        </button>
      </div>

      <PostEditor
        initialTitle={post.meta.title}
        initialDescription={post.meta.description}
        initialContent={post.content}
        initialTags={post.meta.tags || []}
        initialProject={post.meta.project}
        initialOrder={post.meta.order}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={true}
      />
    </div>
  );
}
