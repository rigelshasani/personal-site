import Link from "next/link";
import type { PostMeta } from "@/lib/content";
import { formatDate } from "@/lib/format";

export function PostCard({ meta }: { meta: PostMeta }) {
  return (
    <article className="space-y-1">
      <h2 className="text-xl font-semibold">
        <Link href={`/posts/${meta.slug}`} className="hover:text-accent">
          {meta.title}
        </Link>
      </h2>
      <p className="text-sm text-text-mid">
        {formatDate(meta.date)} · {meta.readingMinutes} min · {meta.summary}
      </p>
    </article>
  );
}
