// src/components/FeaturedPostCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/lib/content';
import { formatDate } from '@/lib/format';

interface FeaturedPostCardProps {
  post: Post;
  size?: 'large' | 'medium';
}

export function FeaturedPostCard({ post, size = 'large' }: FeaturedPostCardProps) {
  // Extract first image from post content or frontmatter
  const getPostImage = () => {
    // Check frontmatter images first
    if (post.meta.images && post.meta.images.length > 0) {
      return post.meta.images[0];
    }
    
    // Look for markdown images in content
    const imageMatch = post.content.match(/!\[.*?\]\((.*?)\)/);
    if (imageMatch) {
      return imageMatch[1];
    }
    
    // Look for Figure components
    const figureMatch = post.content.match(/<Figure[^>]+src="([^"]+)"/);
    if (figureMatch) {
      return figureMatch[1];
    }
    
    return null;
  };

  const imageUrl = getPostImage();
  
  if (!imageUrl) {
    return null; // Don't render if no image
  }

  const cardClasses = size === 'large' 
    ? "group block relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500 aspect-[16/10]"
    : "group block relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 aspect-[4/3]";

  return (
    <Link href={`/posts/${post.slug}`} className={cardClasses}>
      <Image
        src={imageUrl}
        alt={post.meta.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes={size === 'large' ? "(max-width: 768px) 100vw, 70vw" : "(max-width: 768px) 100vw, 50vw"}
        priority={size === 'large'}
        quality={90}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white z-10">
          {post.meta.tags && (
            <div className="mb-2 md:mb-3">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full">
                {post.meta.tags[0]}
              </span>
            </div>
          )}
          
          <h3 className={`font-bold mb-2 leading-tight ${size === 'large' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
            {post.meta.title}
          </h3>
          
          <p className={`text-white mb-3 md:mb-4 leading-relaxed ${size === 'large' ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
            {post.meta.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs md:text-sm text-white/90">
            <span>{formatDate(post.meta.date)}</span>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>
        </div>
        
        {/* Hover effect border */}
        <div className="absolute inset-0 ring-1 ring-black/5 rounded-2xl group-hover:ring-accent/50 transition-all duration-300" />
    </Link>
  );
}