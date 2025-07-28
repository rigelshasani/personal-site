// src/app/projects/page.tsx
import { getAllProjects } from '@/lib/content';
import { ProjectBox } from '@/components/ProjectBox';
import Link from 'next/link';

export const metadata = {
  title: 'Projects',
  description: 'Data analytics projects and technical explorations',
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const featuredProjects = projects.filter(p => p.meta.featured);
  const otherProjects = projects.filter(p => !p.meta.featured);

  return (
    <div className="py-16">
      {/* Home navigation */}
      <div className="mb-8">
        <Link 
          href="/"
          className="text-accent hover:underline text-sm"
        >
          ← Home
        </Link>
      </div>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <p className="text-xl text-foreground/80">
          Data analytics projects and technical explorations
        </p>
      </header>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredProjects.map(project => (
              <ProjectBox key={project.slug} project={project} showPosts={true} />
            ))}
          </div>
        </section>
      )}

      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {featuredProjects.length > 0 ? 'Other Projects' : 'All Projects'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map(project => (
              <ProjectBox key={project.slug} project={project} showPosts={true} />
            ))}
          </div>
        </section>
      )}

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">No projects yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}