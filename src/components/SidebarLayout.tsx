// src/components/SidebarLayout.tsx - SSR Safe
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SideNavigation } from '@/components/SideNavigation';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-light bg-bg/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-semibold text-foreground hover:text-accent transition-colors">
              Rigels
            </Link>
            
            {/* Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-surface-hover transition-all duration-300"
              aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
            >
              <svg 
                className={`w-4 h-4 text-foreground transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <ThemeToggle />
        </div>
      </header>

      <div className="flex">
        {/* Side Navigation */}
        <SideNavigation isCollapsed={isCollapsed} />

        {/* Mobile Overlay - CSS only, no JS detection */}
        {!isCollapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-0' : 'ml-0 md:ml-36'
        }`}>
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-12">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}