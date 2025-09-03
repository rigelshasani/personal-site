// src/app/page.tsx
import Link from 'next/link';
import { getAllProjects, getStandalonePosts, getAllPosts } from '@/lib/content';
import { ProjectBox } from '@/components/ProjectBox';
import { PostBox } from '@/components/PostBox';
import { FeaturedPostCard } from '@/components/FeaturedPostCard';
import { FeaturedPostsCarousel } from '@/components/FeaturedPostsCarousel';
import { PopularPosts } from '@/components/PopularPosts';

export default async function Home() {
  const projects = getAllProjects();
  const allPosts = getAllPosts();
  const standalonePosts = getStandalonePosts();
  const featuredProjects = projects.filter(p => p.meta.featured);
  const recentProjects = projects.slice(0, 3);
  
  // Filter posts with images for featured section
  const postsWithImages = allPosts.filter(post => {
    // Check frontmatter images
    if (post.meta.images && post.meta.images.length > 0) return true;
    // Check content for markdown images or Figure components
    return post.content.match(/!\[.*?\]\(.*?\)/) || post.content.match(/<Figure[^>]+src="/);
  });
  
  const featuredPost = postsWithImages[0];
  const secondaryFeaturedPosts = postsWithImages.slice(1, 3);
  const regularPosts = standalonePosts.filter(post => !postsWithImages.includes(post));

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Thoughts & Analytics
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl">
          Personal essays and data projects exploring the intersection of
          technology, analytics, and human behavior.
        </p>
      </section>

      {/* Featured Posts with Images */}
      {postsWithImages.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8">Featured Posts</h2>
          <FeaturedPostsCarousel posts={postsWithImages} />
          
          {/* Secondary featured posts grid */}
          {postsWithImages.length > 1 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {postsWithImages.slice(1, 4).map(post => (
                <FeaturedPostCard key={post.slug} post={post} size="medium" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredProjects.map(project => (
              <ProjectBox key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Projects</h2>
          <Link
            href="/projects"
            className="text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map(project => (
            <ProjectBox
              key={project.slug}
              project={project}
              showPosts={true}
            />
          ))}
        </div>
      </section>

      {/* Other Posts */}
      {regularPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Posts</h2>
            <Link
              href="/posts"
              className="text-accent hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {regularPosts.slice(0, 5).map(post => (
              <PostBox key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Posts */}
      <section>
        <PopularPosts 
          posts={allPosts.map(post => ({
            slug: post.slug,
            title: post.meta.title,
            date: post.meta.date,
            views: 0 // Will be populated on client-side
          }))}
          showViewCounts={true} 
        />
      </section>
    </div>
  );
}