import { getAllPosts } from "@/lib/content";
import Link from "next/link";

export default async function Home() {
  const posts = await getAllPosts();
  return (
    <section className="py-16">
      <h1 className="text-4xl font-bold mb-12">Latest Essays</h1>
      <ul className="space-y-12">
        {posts.map(p => (
          <li key={p.slug} className="group">
            <h2 className="text-2xl font-semibold mb-1">
              <Link href={`/posts/${p.slug}`} className="hover:text-accent">
                {p.title}
              </Link>
            </h2>
            <p className="text-text-mid text-sm">{new Date(p.date).toLocaleDateString()} · {p.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
