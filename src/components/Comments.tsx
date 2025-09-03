// src/components/Comments.tsx - Anonymous comments system
'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/format';

interface Comment {
  id: string;
  username: string;
  content: string;
  timestamp: string;
  postSlug: string;
}

interface CommentsProps {
  slug: string;
}

// Generate random anonymous usernames
const generateRandomUsername = (): string => {
  const adjectives = [
    'Anonymous', 'Mysterious', 'Silent', 'Curious', 'Thoughtful', 'Wandering',
    'Hidden', 'Secret', 'Quiet', 'Wise', 'Swift', 'Gentle', 'Bold', 'Clever',
    'Bright', 'Shadow', 'Midnight', 'Dawn', 'Twilight', 'Cosmic', 'Digital',
    'Neon', 'Electric', 'Crystal', 'Silver', 'Golden', 'Arctic', 'Desert'
  ];
  
  const nouns = [
    'Reader', 'Visitor', 'Thinker', 'Observer', 'Explorer', 'Dreamer',
    'Philosopher', 'Scholar', 'Wanderer', 'Seeker', 'Sage', 'Mind', 'Soul',
    'Spirit', 'Ghost', 'Phantom', 'Voice', 'Echo', 'Whisper', 'Traveler',
    'Coder', 'Hacker', 'User', 'Guest', 'Stranger', 'Friend', 'Being'
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${noun}${number}`;
};

export function Comments({ slug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Load comments from localStorage and check theme on mount
  useEffect(() => {
    const savedComments = localStorage.getItem('blog-comments');
    if (savedComments) {
      try {
        const allComments = JSON.parse(savedComments) as Comment[];
        const postComments = allComments.filter(comment => comment.postSlug === slug);
        setComments(postComments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      } catch (error) {
        console.warn('Failed to load comments:', error);
      }
    }

    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: generateRandomUsername(),
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      postSlug: slug
    };

    try {
      // Save to localStorage
      const savedComments = localStorage.getItem('blog-comments');
      const allComments = savedComments ? JSON.parse(savedComments) : [];
      allComments.push(comment);
      localStorage.setItem('blog-comments', JSON.stringify(allComments));

      // Update local state
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.warn('Failed to save comment:', error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="comment" className="sr-only">
            Write your comment
          </label>
          <textarea
            id="comment"
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            placeholder="Share your thoughts anonymously... (You'll get a random username)"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Anonymous posting • New random username each time</span>
            <span>{newComment.length}/1000</span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="px-4 py-2 text-white rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{
            backgroundColor: isDark ? '#059669' : '#2563eb',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#047857' : '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#059669' : '#2563eb';
          }}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="font-medium text-sm"
                  style={{ color: isDark ? '#10b981' : '#2563eb' }}
                >
                  {comment.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.timestamp)}
                </span>
              </div>
              <p 
                className="whitespace-pre-wrap"
                style={{ color: isDark ? '#ffffff' : '#111827' }}
              >
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}