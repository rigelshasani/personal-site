// src/components/mdx/OptimizedImage.tsx
import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/images";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width = 800, 
  height = 600, 
  className = "",
  priority = false 
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={85}
      priority={priority}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={`transition-opacity duration-300 ${className}`}
      style={{ objectFit: "cover" }}
    />
  );
}
