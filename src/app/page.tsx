// src/app/page.tsx
import Link from 'next/link';
import { getAllProjects, getStandalonePosts } from '@/lib/content';
import { ProjectBox } from '@/components/ProjectBox';
import { PostBox } from '@/components/PostBox';

export default async function Home() {
  const projects = getAllProjects();
  const standalonePosts = getStandalonePosts();
  const featuredProjects = projects.filter(p => p.meta.featured);
  const recentProjects = projects.slice(0, 3);

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

      {/* Standalone Posts */}
      {standalonePosts.length > 0 && (
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
            {standalonePosts.slice(0, 5).map(post => (
              <PostBox key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}