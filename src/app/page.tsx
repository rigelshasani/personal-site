// src/app/page.tsx
import { getAllPosts } from "@/lib/content";
import { getAllProjects } from "@/lib/projects";
import Link from "next/link";

export default async function Home() {
  const [posts, projects] = await Promise.all([getAllPosts(), getAllProjects()]);

  return (
    <section className="py-16 space-y-16">
      <div>
        <h1 className="text-4xl font-bold mb-12">Latest Essays</h1>
        <div className="space-y-12">
          {posts.slice(0,5).map(p => (
            <article key={p.slug}>
              <h2 className="text-2xl font-semibold mb-1">
                <Link href={`/posts/${p.slug}`} className="hover:text-accent">{p.title}</Link>
              </h2>
              <p className="text-text-mid text-sm">
                {new Date(p.date).toLocaleDateString()} · {p.summary}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-semibold mb-8">Projects</h2>
        <div className="space-y-8">
          {projects.slice(0,4).map(pr => (
            <article key={pr.slug}>
              <h3 className="text-xl font-semibold">
                <Link href={`/projects/${pr.slug}`} className="hover:text-accent">{pr.title}</Link>
              </h3>
              <p className="text-text-mid text-sm">
                {new Date(pr.date).toLocaleDateString()} · {pr.summary}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
