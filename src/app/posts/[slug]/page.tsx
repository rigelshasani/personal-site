// src/app/posts/[slug]/page.tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getAllPosts, getProject } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Figure } from "@/components/mdx/Figure";
import { OptimizedImage } from "@/components/mdx/OptimizedImage";
import { ViewTrackerWithNotification } from "@/components/ViewTrackerWithNotification";
import { Comments } from "@/components/Comments";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

type PostParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PostParams>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      type: "article",
      title: post.meta.title,
      description: post.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<PostParams>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  
  if (!post) {
    notFound();
  }

  // Get project info if this post belongs to one
  const project = post.meta.project ? getProject(post.meta.project) : null;

  return (
    <article className="prose prose-invert max-w-none py-16">
      <header className="mb-8">
        {/* Project breadcrumb */}
        {project && (
          <div className="mb-4">
            <Link 
              href={`/projects/${project.slug}`}
              className="text-sm text-accent hover:underline no-underline"
            >
              ← {project.meta.title}
            </Link>
          </div>
        )}
        
        <h1 className="text-4xl font-bold mb-4">{post.meta.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-mid not-prose">
          <span>{formatDate(post.meta.date)}</span>
          <span>• {post.readingTime}</span>
          <ViewTrackerWithNotification slug={post.slug} />
          {post.meta.tags && (
            <>
              <span>•</span>
              <div className="flex gap-2">
                {post.meta.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Project context */}
        {project && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg not-prose">
            <p className="text-sm text-mid mb-2">
              This post is part of the <strong>{project.meta.title}</strong> project series.
            </p>
            {project.posts.length > 1 && (
              <div className="text-sm">
                <span className="text-mid">Other posts in this series:</span>
                <ul className="mt-2 space-y-1">
                  {project.posts
                    .filter(p => p.slug !== slug)
                    .slice(0, 3)
                    .map(p => (
                      <li key={p.slug}>
                        <Link 
                          href={`/posts/${p.slug}`}
                          className="text-accent hover:underline"
                        >
                          {p.meta.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </header>
      
      <MDXRemote 
        source={post.content} 
        components={{
          Figure,
          img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
            <OptimizedImage
              src={typeof props.src === 'string' ? props.src : ''}
              alt={props.alt || ''}
              width={typeof props.width === 'number' ? props.width : (typeof props.width === 'string' ? parseInt(props.width, 10) : 800)}
              height={typeof props.height === 'number' ? props.height : (typeof props.height === 'string' ? parseInt(props.height, 10) : 600)}
              className="rounded-lg my-4"
            />
          ),
        }}
      />
      
      {/* Navigation to next/prev posts in project */}
      {project && project.posts.length > 1 && (
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 not-prose">
          <div className="flex justify-between">
            {/* Previous post */}
            {(() => {
              const currentIndex = project.posts.findIndex(p => p.slug === slug);
              const prevPost = project.posts[currentIndex - 1];
              return prevPost ? (
                <Link 
                  href={`/posts/${prevPost.slug}`}
                  className="text-accent hover:underline"
                >
                  ← {prevPost.meta.title}
                </Link>
              ) : <div />;
            })()}
            
            {/* Next post */}
            {(() => {
              const currentIndex = project.posts.findIndex(p => p.slug === slug);
              const nextPost = project.posts[currentIndex + 1];
              return nextPost ? (
                <Link 
                  href={`/posts/${nextPost.slug}`}
                  className="text-accent hover:underline"
                >
                  {nextPost.meta.title} →
                </Link>
              ) : <div />;
            })()}
          </div>
        </footer>
      )}
      
      {/* Comments section */}
      <Comments slug={slug} />
    </article>
  );
}