import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PostMeta } from './content';
import { validateFrontmatter } from './dev-utils';
export { generateSlug } from './slug';

const contentDirectory = path.join(process.cwd(), 'src/content/posts');

export function createPostFile(slug: string, meta: PostMeta, content: string): void {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    throw new Error('Post with this slug already exists');
  }
  
  const frontmatter = matter.stringify(content, meta);
  
  // Ensure directory exists
  if (!fs.existsSync(contentDirectory)) {
    fs.mkdirSync(contentDirectory, { recursive: true });
  }
  
  fs.writeFileSync(filePath, frontmatter);
}

export function updatePostFile(slug: string, meta: PostMeta, content: string): void {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error('Post not found');
  }
  
  const frontmatter = matter.stringify(content, meta);
  fs.writeFileSync(filePath, frontmatter);
}

export function deletePostFile(slug: string): void {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error('Post not found');
  }
  
  fs.unlinkSync(filePath);
}

export function validatePostData(meta: PostMeta, content: string): void {
  if (!meta.title?.trim()) throw new Error('Title is required');
  if (!meta.description?.trim()) throw new Error('Description is required');
  if (!meta.date) throw new Error('Date is required');
  if (!content?.trim()) throw new Error('Content is required');

  const { errors } = validateFrontmatter(meta as Record<string, unknown>, 'post');
  for (const err of errors) {
    if (err.message.startsWith('Invalid date format')) throw new Error('Invalid date format');
    if (err.message === 'Tags must be an array') throw new Error('Tags must be an array');
    if (err.message === 'Order must be a positive integer') throw new Error('Order must be a positive integer');
  }
}