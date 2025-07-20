import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

const DIR = path.join(process.cwd(), "src/content/projects");

export async function generateStaticParams() {
  const files = (await fs.readdir(DIR)).filter(f => f.endsWith(".mdx"));
  return files.map(f => ({ slug: f.replace(/\.mdx$/, "") }));
}

export default async function ProjectPage(
  props: { params: { slug: string } }
) {
  const { slug } = props.params;          // ← safe, no warning

  let raw: string;
  try {
    raw = await fs.readFile(path.join(DIR, `${slug}.mdx`), "utf8");
  } catch {
    notFound();
  }

  const { data, content } = matter(raw);

  return (
    <article className="prose prose-invert max-w-none py-16">
      <h1>{data.title}</h1>
      <p className="text-sm text-text-mid">
        {new Date(data.date).toLocaleDateString()}
        {data.status ? ` · ${data.status}` : ""}
      </p>

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
