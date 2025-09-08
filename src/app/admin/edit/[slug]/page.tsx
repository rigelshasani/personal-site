'use client';

import { useEffect, useState } from 'react';
import { PostEditor } from '@/components/PostEditor';
import { PostMeta, getPost } from '@/lib/content';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const postData = getPost(slug);
      if (!postData) {
        setError('Post not found');
      } else {
        setPost(postData);
      }
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const handleSave = async (meta: PostMeta, content: string) => {
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