//./src/app/layout.tsx
import "@/styles/global.css";
import { bellota } from "@/fonts";
import type { Metadata } from "next";
import { SidebarLayout } from "@/components/SidebarLayout";

export const metadata: Metadata = {
  title: {
    default: "Rigels · Thoughts & Analytics",
    template: "%s · Rigels",
  },
  description: "Personal essays and data projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bellota.variable}>
      <body className="font-sans antialiased bg-bg text-foreground min-h-screen">
        <SidebarLayout>
          {children}
        </SidebarLayout>

        {/* Progress bar */}
        <div className="fixed top-0 left-0 h-0.5 bg-accent z-[100] transition-all duration-150" id="progress-bar" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                const bar = document.getElementById('progress-bar');
                window.addEventListener('scroll', () => {
                  const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                  bar.style.width = progress + '%';
                }, { passive: true });
              })();`,
          }}
        />
      </body>
    </html>
  );
}