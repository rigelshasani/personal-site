// src/app/projects/[slug]/page.tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, getAllProjects } from "@/lib/content-gateway";
import { formatDate } from "@/lib/format";
import { PostBox } from "@/components/PostBox";
import { statusColors } from "@/lib/constants";
import { Figure } from "@/components/mdx/Figure";
import ViewHit from "@/components/ViewHit"; // + track views once per session

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

type ProjectParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<ProjectParams>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.meta.title,
    description: project.meta.description,
    openGraph: {
      type: "article",
      title: project.meta.title,
      description: project.meta.description,
    },
    twitter: {
      card: "summary",
      title: project.meta.title,
      description: project.meta.description,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<ProjectParams>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="py-16">
      {/* once-per-session increment, no UI */}
      <ViewHit slug={slug} />

      {/* Back navigation */}
      <div className="mb-8">
        <Link href="/projects" className="text-accent hover:underline text-sm">
          ← All Projects
        </Link>
      </div>

      {/* Project Header */}
      <header className="mb-12">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-4xl font-bold">{project.meta.title}</h1>
          <span
            className={`px-3 py-1 text-sm rounded-full ${statusColors[project.meta.status]}`}
          >
            {project.meta.status}
          </span>
        </div>

        <p className="text-xl text-foreground/80 mb-6">
          {project.meta.description}
        </p>

        <div className="flex items-center gap-6 text-sm text-mid mb-6">
          <span>{formatDate(project.meta.date)}</span>
          {project.posts.length > 0 && (
            <span>• {project.posts.length} post{project.posts.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Tech Stack */}
        {project.meta.tech && project.meta.tech.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.meta.tech.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {(project.meta.github || project.meta.demo) && (
          <div className="flex gap-4">
            {project.meta.github && (
              <a
                href={project.meta.github}
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub →
              </a>
            )}
            {project.meta.demo && (
              <a
                href={project.meta.demo}
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Demo →
              </a>
            )}
          </div>
        )}
      </header>

      {/* Project Content */}
      <article className="prose prose-invert max-w-none mb-16">
        <MDXRemote
          source={project.content}
          components={{
            Figure,
          }}
        />
      </article>

      {/* Related Posts */}
      {project.posts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">
            Posts in this Series ({project.posts.length})
          </h2>
          <div className="space-y-6">
            {project.posts.map((post) => (
              <PostBox key={post.slug} post={post} showProject={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
