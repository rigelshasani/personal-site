import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { PostMeta } from '@/lib/content';
import { createPostFile, generateSlug, validatePostData } from '@/lib/post-utils';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin();
    
    const body = await request.json();
    const { meta, content } = body as { meta: PostMeta; content: string };
    
    // Validate input data
    validatePostData(meta, content);
    
    // Generate slug from title
    const slug = generateSlug(meta.title);
    
    // Create the post file
    createPostFile(slug, meta, content);
    
    return NextResponse.json({ 
      success: true, 
      slug,
      message: 'Post created successfully' 
    });
    
  } catch (error) {
    console.error('Failed to create post:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized: Admin access required' ? 401 : 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}