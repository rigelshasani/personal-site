// src/components/mdx/Figure.tsx
import React from "react";
import Image from "next/image";

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  align?: "left" | "right" | "center";
  widthClass?: string; // e.g., "w-72", "md:w-96"
  width?: number;
  height?: number;
}

export function Figure({ 
  src, 
  alt, 
  caption, 
  align = "center", 
  widthClass = "w-full md:w-80",
  width = 800,
  height = 600
}: FigureProps) {
  // Base classes for all layouts
  const baseClasses = "mb-4 rounded-lg overflow-hidden shadow-card";
  
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
        className="w-full h-auto"
        style={{ objectFit: "cover" }}
      />
      {caption && (
        <figcaption className="px-3 py-2 text-sm text-text-mid bg-surface text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}