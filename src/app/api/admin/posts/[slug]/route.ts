import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { PostMeta } from '@/lib/content';
import { updatePostFile, deletePostFile, validatePostData } from '@/lib/post-utils';
import { shouldUseDb, updatePost as updatePostDb, deletePost as deletePostDb } from '@/lib/content-service';

const SLUG_RE = /^[a-z0-9-]+$/

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const { slug } = await context.params;
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }
    const body = await request.json();
    const { meta, content } = body as { meta: PostMeta; content: string };
    
    // Validate input data
    validatePostData(meta, content);
    
    if (shouldUseDb()) {
      await updatePostDb(slug, meta, content);
    } else {
      // Update the post file
      updatePostFile(slug, meta, content);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Post updated successfully' 
    });
    
  } catch (error) {
    console.error('Failed to update post:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized: Admin access required' ? 401 : 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const { slug } = await context.params;
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }
    
    if (shouldUseDb()) {
      await deletePostDb(slug);
    } else {
      // Delete the post file
      deletePostFile(slug);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Post deleted successfully' 
    });
    
  } catch (error) {
    console.error('Failed to delete post:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized: Admin access required' ? 401 : 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
