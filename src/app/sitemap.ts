import { getAllPosts, getAllProjects } from '@/lib/content-gateway';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rigels.dev';

export default async function sitemap() {
  const [posts, projects] = await Promise.all([getAllPosts(), getAllProjects()]);

  const postEntries = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.meta.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const projectEntries = projects.map((project) => ({
    url: `${BASE_URL}/projects/${project.slug}`,
    lastModified: new Date(project.meta.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const staticRoutes = ['/', '/posts', '/projects', '/about'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1.0 : 0.6,
  }));

  return [...staticRoutes, ...projectEntries, ...postEntries];
}
