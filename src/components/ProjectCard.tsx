import Link from "next/link";
import type { ProjectMeta } from "@/lib/projects";

export function ProjectCard({ meta }: { meta: ProjectMeta }) {
  return (
    <article>
      <h3 className="text-xl font-semibold">
        <Link href={`/projects/${meta.slug}`} className="hover:text-accent">
          {meta.title}
        </Link>
      </h3>
      <p className="text-text-mid text-sm">
        {new Date(meta.date).toLocaleDateString()} · {meta.summary}
      </p>
    </article>
  );
}
