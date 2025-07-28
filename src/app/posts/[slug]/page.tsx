// src/app/posts/[slug]/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export async function generateStaticParams() {
  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".mdx"));
  return files.map((f) => ({ slug: f.replace(/\.mdx$/, "") }));
}

type PostParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PostParams>;
}) {
  const { slug } = await params;
  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
    const { data, content } = matter(raw);
    const words = content.split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.round(words / 225));
    return {
      title: data.title,
      description: data.summary,
      openGraph: {
        type: "article",
        title: data.title,
        description: data.summary,
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.summary,
      },
      other: { "x-reading-minutes": String(readingMinutes) },
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<PostParams>;
}) {
  const { slug } = await params;

  let raw: string;
  try {
    raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
  } catch {
    notFound();
  }

  const { data, content } = matter(raw);
  const words = content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(words / 225));

  return (
    <article className="prose prose-invert max-w-none py-16">
      <header className="mb-8">
        <h1>{data.title}</h1>
        <p className="text-sm text-text-mid">
          {formatDate(data.date)} · {readingMinutes} min
        </p>
      </header>
      <MDXRemote source={content} />
    </article>
  );
}
