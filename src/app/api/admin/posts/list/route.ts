import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllPosts } from '@/lib/content-gateway';

export async function GET() {
  try {
    // Verify admin authentication
    await requireAdmin();
    
    // Get all posts but return meta payload only (avoid sending full content)
    const posts = (await getAllPosts()).map(p => ({
      slug: p.slug,
      meta: p.meta,
      readingTime: p.readingTime,
    }));
    
    return NextResponse.json({ 
      success: true,
      posts 
    });
    
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
