import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface PostMeta {
  slug: string;
  title: string;
  date: string; // ISO
  summary: string;
  readingMinutes: number;
}

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
const WPM = 225;

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".mdx"));

  const metas: PostMeta[] = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    if (!data.title || !data.date || !data.summary) {
      // optionally throw instead:
      // throw new Error(`Missing frontmatter fields in ${file}`);
      continue;
    }

    const words = content.split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.round(words / WPM));

    metas.push({
      slug: file.replace(/\.mdx$/, ""),
      title: data.title,
      date: data.date,
      summary: data.summary,
      readingMinutes,
    });
  }

  metas.sort((a, b) => (a.date < b.date ? 1 : -1));
  return metas;
}
