// src/app/projects/[slug]/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";

const DIR = path.join(process.cwd(), "src/content/projects");

export async function generateStaticParams() {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".mdx"));
  return files.map((f) => ({ slug: f.replace(/\.mdx$/, "") }));
}

type ProjectParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<ProjectParams>;
}) {
  const { slug } = await params;
  try {
    const raw = await fs.readFile(path.join(DIR, `${slug}.mdx`), "utf8");
    const { data } = matter(raw);
    return {
      title: data.title,
      description: data.summary,
      openGraph: {
        type: "article",
        title: data.title,
        description: data.summary,
      },
      twitter: {
        card: "summary",
        title: data.title,
        description: data.summary,
      },
    };
  } catch {
    return { title: "Project Not Found" };
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<ProjectParams>;
}) {
  const { slug } = await params;

  let raw: string;
  try {
    raw = await fs.readFile(path.join(DIR, `${slug}.mdx`), "utf8");
  } catch {
    notFound();
  }

  const { data, content } = matter(raw);

  return (
    <article className="prose prose-invert max-w-none py-16">
      <header className="mb-8">
        <h1>{data.title}</h1>
        <p className="text-sm text-text-mid">
          {formatDate(data.date)}
          {data.status ? ` · ${data.status}` : ""}
        </p>
      </header>
      <MDXRemote source={content} />
      {(data.stack || data.impact) && (
        <aside className="mt-10 text-sm text-text-mid space-y-1">
          {data.stack && (
            <div>
              <strong>Stack:</strong> {data.stack.join(", ")}
            </div>
          )}
          {data.impact && (
            <div>
              <strong>Impact:</strong> {data.impact}
            </div>
          )}
        </aside>
      )}
    </article>
  );
}
