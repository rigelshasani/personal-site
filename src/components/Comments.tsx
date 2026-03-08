'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/format';

interface Comment {
  id: string;
  username: string;
  content: string;
  timestamp: string;
}

interface CommentsProps {
  slug: string;
}

const adjectives = [
  'Anonymous', 'Mysterious', 'Silent', 'Curious', 'Thoughtful', 'Wandering',
  'Hidden', 'Secret', 'Quiet', 'Wise', 'Swift', 'Gentle', 'Bold', 'Clever',
  'Bright', 'Shadow', 'Midnight', 'Dawn', 'Twilight', 'Cosmic', 'Digital',
  'Neon', 'Electric', 'Crystal', 'Silver', 'Golden', 'Arctic', 'Desert',
];

const nouns = [
  'Reader', 'Visitor', 'Thinker', 'Observer', 'Explorer', 'Dreamer',
  'Philosopher', 'Scholar', 'Wanderer', 'Seeker', 'Sage', 'Mind', 'Soul',
  'Spirit', 'Ghost', 'Phantom', 'Voice', 'Echo', 'Whisper', 'Traveler',
  'Coder', 'Hacker', 'User', 'Guest', 'Stranger', 'Friend', 'Being',
];

function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${noun}${number}`;
}

export function Comments({ slug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/comments/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setComments(data.comments);
      })
      .catch(() => setError('Failed to load comments'))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: generateRandomUsername(),
          content: newComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
      } else {
        setError(data.error ?? 'Failed to post comment');
      }
    } catch {
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="not-prose mt-12 pt-8 border-t border-border-light">
      <h3 className="text-xl font-semibold mb-6 text-foreground">
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
            className="w-full px-3 py-2 border border-border-light rounded-lg bg-bg text-foreground placeholder-mid focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            placeholder="Share your thoughts anonymously... (You'll get a random username)"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2 text-sm text-mid">
            <span>Anonymous posting • New random username each time</span>
            <span>{newComment.length}/1000</span>
          </div>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="px-4 py-2 bg-accent hover:opacity-90 text-white rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-mid text-center py-8">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-mid text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-border-light pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm text-accent">
                  {comment.username}
                </span>
                <span className="text-xs text-mid">
                  {formatDate(comment.timestamp)}
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
