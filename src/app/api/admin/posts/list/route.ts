import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllPosts } from '@/lib/content';

export async function GET() {
  try {
    // Verify admin authentication
    await requireAdmin();
    
    // Get all posts
    const posts = getAllPosts();
    
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