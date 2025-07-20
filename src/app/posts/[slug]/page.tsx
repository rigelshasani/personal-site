import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export async function generateStaticParams() {
  const files = await fs.readdir(POSTS_DIR);
  return files.filter(f=>f.endsWith(".mdx")).map(f=>({ slug:f.replace(/\.mdx$/,"") }));
}

export default async function PostPage({ params:{slug} }:{ params:{slug:string} }) {
  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
    const { content, data } = matter(raw);
    return (
      <article className="prose prose-invert max-w-none py-16">
        <h1>{data.title}</h1>
        <p className="text-sm text-text-mid">{new Date(data.date).toLocaleDateString()}</p>
        <MDXRemote source={content} />
      </article>
    );
  } catch {
    notFound();
  }
}
