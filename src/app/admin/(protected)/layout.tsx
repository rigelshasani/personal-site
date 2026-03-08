import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    default: 'Rigels Admin',
    template: '%s · Rigels Admin',
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-bg text-foreground">
      <nav className="border-b border-border-light bg-bg/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="text-lg font-semibold text-foreground hover:text-accent transition-colors">
                Rigels Admin
              </Link>
              <div className="flex space-x-2">
                <Link
                  href="/admin"
                  className="text-mid hover:text-foreground px-3 py-1.5 text-sm font-medium rounded-md hover:bg-surface transition-colors"
                >
                  Posts
                </Link>
                <Link
                  href="/admin/create"
                  className="bg-accent hover:opacity-90 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-opacity"
                >
                  New Post
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="text-mid hover:text-foreground px-3 py-1.5 text-sm font-medium rounded-md hover:bg-surface transition-colors"
              >
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
