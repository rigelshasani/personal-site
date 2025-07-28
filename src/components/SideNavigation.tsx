// src/components/SideNavigation.tsx - SSR Safe
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SideNavigationProps {
  isCollapsed: boolean;
}

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/writing', label: 'Writing' },
  { href: '/philosophy', label: 'Philosophy' },
  { href: '/tech', label: 'Tech' },
  { href: '/about', label: 'About' },
];

export function SideNavigation({ isCollapsed }: SideNavigationProps) {
  const pathname = usePathname();

  if (isCollapsed) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 md:w-36 bg-bg transition-all duration-300 z-40 border-r border-border-light md:border-r-0 shadow-lg md:shadow-none">
      {/* Navigation Content - Centered */}
      <div className="h-full flex items-center justify-center">
        <nav className="space-y-8 md:space-y-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-center text-2xl md:text-xl font-bold transition-colors ${
                  isActive
                    ? 'text-accent'
                    : 'text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}