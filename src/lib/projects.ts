import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface ProjectMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  status?: string;
  stack?: string[];
  impact?: string;
}

const DIR = path.join(process.cwd(), "src/content/projects");

export async function getAllProjects(): Promise<ProjectMeta[]> {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".mdx"));
  const metas: ProjectMeta[] = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(DIR, f), "utf8");
    const { data } = matter(raw);
    metas.push({
      slug: f.replace(/\.mdx$/, ""),
      title: data.title,
      date: data.date,
      summary: data.summary,
      status: data.status,
      stack: data.stack ?? [],
      impact: data.impact,
    });
  }
  return metas.sort((a, b) => (a.date < b.date ? 1 : -1));
}
