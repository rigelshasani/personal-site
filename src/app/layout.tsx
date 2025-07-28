//src/app/layout.tsx
import "@/styles/global.css";
import { bellota } from "@/fonts";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: {
    default: "Rigels · Thoughts & Analytics",
    template: "%s · Rigels",
  },
  description: "Personal essays and data projects.",
};

const year = new Date().getFullYear();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bellota.variable}>
      <body className="font-sans antialiased bg-bg text-foreground min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border-light bg-bg/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-xl font-semibold text-foreground hover:text-accent transition-colors">
                  Rigels
                </Link>
                
                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                  <Link href="/projects" className="text-sm font-medium text-text-mid hover:text-foreground transition-colors">
                    Projects
                  </Link>
                  <Link href="/posts" className="text-sm font-medium text-text-mid hover:text-foreground transition-colors">
                    Writing
                  </Link>
                  <Link href="/about" className="text-sm font-medium text-text-mid hover:text-foreground transition-colors">
                    About
                  </Link>
                </nav>
              </div>
              
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border-light bg-surface">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-text-mid">
                ©{year} Rigels Hasani. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-6">
                <Link href="/rss" className="text-sm text-text-mid hover:text-foreground transition-colors">
                  RSS
                </Link>
                <Link href="https://github.com/rigelhasani" className="text-sm text-text-mid hover:text-foreground transition-colors">
                  GitHub
                </Link>
                <Link href="https://twitter.com/rigelhasani" className="text-sm text-text-mid hover:text-foreground transition-colors">
                  Twitter
                </Link>
              </div>
            </div>
          </div>
        </footer>

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