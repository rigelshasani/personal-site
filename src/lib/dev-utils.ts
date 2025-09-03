// src/lib/dev-utils.ts - Development utilities for better MDX experience
import fs from 'fs';
import path from 'path';

// Content cache for development
const contentCache = new Map();
let lastCheckTime = 0;

export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

// Watch for content changes in development
export function watchContentChanges() {
  if (!isDevelopment()) return;

  const contentDir = path.join(process.cwd(), 'src/content');
  
  // Simple file modification time checking
  const checkForChanges = () => {
    try {
      const stats = fs.statSync(contentDir);
      const currentTime = stats.mtime.getTime();
      
      if (currentTime > lastCheckTime) {
        lastCheckTime = currentTime;
        // Clear cache when content changes
        contentCache.clear();
        console.log('🔄 Content cache cleared due to file changes');
      }
    } catch (error) {
      console.warn('Could not check content directory for changes');
    }
  };

  // Check every 2 seconds in development
  const interval = setInterval(checkForChanges, 2000);
  
  // Cleanup on process exit
  process.on('exit', () => clearInterval(interval));
  
  return interval;
}

// Cache content with automatic invalidation
export function cacheContent<T>(key: string, factory: () => T): T {
  if (!isDevelopment()) {
    return factory();
  }

  if (contentCache.has(key)) {
    return contentCache.get(key);
  }

  const content = factory();
  contentCache.set(key, content);
  return content;
}

// Development logging for content operations
export function devLog(message: string, data?: any) {
  if (isDevelopment()) {
    console.log(`📝 [Content] ${message}`, data || '');
  }
}

// Helper to validate frontmatter during development
export function validateFrontmatter(frontmatter: any, filename: string) {
  if (!isDevelopment()) return;

  const required = ['title', 'date', 'description'];
  const missing = required.filter(field => !frontmatter[field]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  [${filename}] Missing required frontmatter fields:`, missing);
  }

  // Validate date format
  if (frontmatter.date && !Date.parse(frontmatter.date)) {
    console.warn(`⚠️  [${filename}] Invalid date format: ${frontmatter.date}`);
  }

  // Validate tags
  if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
    console.warn(`⚠️  [${filename}] Tags should be an array`);
  }
}