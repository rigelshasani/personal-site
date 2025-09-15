// src/components/mdx/Figure.tsx
import React from "react";
import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/images";

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  align?: "left" | "right" | "center";
  widthClass?: string; // e.g., "w-72", "md:w-96"
  width?: number;
  height?: number;
  priority?: boolean; // For above-the-fold images
  quality?: number; // Image quality (1-100)
}

export function Figure({ 
  src, 
  alt, 
  caption, 
  align = "center", 
  widthClass = "w-full md:w-80",
  width = 800,
  height = 600,
  priority = false,
  quality = 85
}: FigureProps) {
  // Base classes for all layouts
  const baseClasses = "mb-4 rounded-lg overflow-hidden";
  
  // Mobile: always stack full width
  const mobileClasses = "w-full mx-auto";
  
  // Desktop alignment classes
  const desktopClasses = {
    left: "md:float-left md:mr-6 md:mb-4",
    right: "md:float-right md:ml-6 md:mb-4", 
    center: "md:mx-auto md:block"
  };
  
  // Combine all classes
  const figureClasses = [
    baseClasses,
    mobileClasses,
    desktopClasses[align],
    widthClass
  ].join(" ");
  
  return (
    <figure className={figureClasses}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="w-full h-auto transition-opacity duration-300"
        style={{ 
          objectFit: "cover"
        }}
      />
      {caption && (
        <figcaption className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
