import { SidebarLayout } from '@/components/SidebarLayout';
import { ProgressBar } from '@/components/ProgressBar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarLayout>{children}</SidebarLayout>
      <ProgressBar />
    </>
  );
}
