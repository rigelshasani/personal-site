import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getAllProjects } from '@/lib/content-gateway';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await getAllProjects();
  return NextResponse.json({
    projects: projects.map((p) => ({ slug: p.slug, title: p.meta.title })),
  });
}
