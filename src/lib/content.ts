import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;  // ISO
  summary: string;
}

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await fs.readdir(POSTS_DIR);
  const metas: PostMeta[] = [];

  for (const file of files.filter(f => f.endsWith(".mdx"))) {
    const raw = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(raw);
    metas.push({
      slug: file.replace(/\.mdx$/, ""),
      title: data.title,
      date: data.date,
      summary: data.summary
    });
  }
  return metas.sort((a,b) => (a.date < b.date ? 1 : -1));
}
