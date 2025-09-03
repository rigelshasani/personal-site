// src/app/posts/page.tsx
import { getAllPosts } from '@/lib/content';
import { PostBox } from '@/components/PostBox';

export const metadata = {
  title: 'All Posts',
  description: 'All blog posts and essays',
};

export default function PostsPage() {
  const posts = getAllPosts();
  
  // Group posts by category if they have tags
  const philosophyPosts = posts.filter(post => 
    post.meta.tags?.includes('philosophy') || post.meta.tags?.includes('thoughts')
  );
  const techPosts = posts.filter(post => 
    post.meta.tags?.includes('tech') || post.meta.tags?.includes('programming') || post.meta.tags?.includes('tutorial')
  );
  const analyticsPosts = posts.filter(post => 
    post.meta.tags?.includes('analytics')
  );
  const otherPosts = posts.filter(post => 
    !post.meta.tags?.some(tag => ['philosophy', 'thoughts', 'tech', 'programming', 'tutorial', 'analytics'].includes(tag))
  );

  return (
    <div className="py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">All Posts</h1>
        <p className="text-xl text-foreground/80">
          Essays, thoughts, and technical writing
        </p>
      </header>

      {/* Philosophy Posts */}
      {philosophyPosts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Philosophy & Thoughts</h2>
          <div className="space-y-6">
            {philosophyPosts.map(post => (
              <PostBox key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Tech Posts */}
      {techPosts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Tech & Programming</h2>
          <div className="space-y-6">
            {techPosts.map(post => (
              <PostBox key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Analytics Posts */}
      {analyticsPosts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Data Analytics</h2>
          <div className="space-y-6">
            {analyticsPosts.map(post => (
              <PostBox key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Other Posts */}
      {otherPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Other Posts</h2>
          <div className="space-y-6">
            {otherPosts.map(post => (
              <PostBox key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">No posts yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}