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
  const rawImageUrl = post.firstImageUrl;
  const isValid = (url: string) => url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
  const imageUrl = rawImageUrl && isValid(rawImageUrl) ? rawImageUrl : null;
  
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
      <div className={`absolute inset-0 flex flex-col justify-end text-white z-10 ${
        size === 'large' ? 'p-6 md:p-8' : 'p-4 md:p-5'
      }`}>
          {post.meta.tags && (
            <div className={size === 'large' ? 'mb-2 md:mb-3' : 'mb-2'}>
              <span className={`inline-block px-2 py-1 font-medium bg-white/20 backdrop-blur-sm rounded-full ${
                size === 'large' ? 'text-xs px-3' : 'text-xs'
              }`}>
                {post.meta.tags[0]}
              </span>
            </div>
          )}
          
          <h3 className={`font-bold mb-2 leading-tight ${
            size === 'large' ? 'text-2xl md:text-3xl' : 'text-base md:text-lg'
          }`}>
            {post.meta.title}
          </h3>
          
          <p className={`text-white mb-2 leading-relaxed line-clamp-2 ${
            size === 'large' ? 'text-base md:text-lg mb-3 md:mb-4' : 'text-xs md:text-sm'
          }`}>
            {post.meta.description}
          </p>
          
          <div className={`flex items-center gap-3 text-white/90 ${
            size === 'large' ? 'text-xs md:text-sm' : 'text-xs'
          }`}>
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
