import { getAllPosts } from "@/lib/content";
import { getAllProjects } from "@/lib/projects";
import { PostCard } from "@/components/PostCard";
import { ProjectCard } from "@/components/ProjectCard";

export default async function Home() {
  const [posts, projects] = await Promise.all([
    getAllPosts(),
    getAllProjects(),
  ]);

  return (
    <section className="py-16 space-y-16">
      <div>
        <h1 className="text-4xl font-bold mb-12">Latest Essays</h1>
        <div className="space-y-12">
          {posts.slice(0, 5).map((p) => (
            <PostCard key={p.slug} meta={p} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-semibold mb-8">Projects</h2>
        <div className="space-y-8">
          {projects.slice(0, 4).map((pr) => (
            <ProjectCard key={pr.slug} meta={pr} />
          ))}
        </div>
      </div>
    </section>
  );
}
