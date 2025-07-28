// src/components/ThemeToggle.tsx - Fixed Version
'use client';

import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check initial theme - default to LIGHT mode
    const saved = localStorage.getItem('theme');
    let shouldBeDark = false;
    
    if (saved === 'dark') {
      shouldBeDark = true;
    } else if (saved === 'light') {
      shouldBeDark = false;
    } else {
      // No saved preference - default to light mode instead of system preference
      shouldBeDark = false;
    }
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    
    if (dark) {
      root.classList.add('dark');
      root.style.setProperty('--background', '#0d0d0d');
      root.style.setProperty('--foreground', '#fafafa');
      root.style.setProperty('--text-mid', '#999999');
      root.style.setProperty('--color-accent', '#10a37f');
    } else {
      // IMPORTANT: Remove the dark class for light mode
      root.classList.remove('dark');
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#171717');
      root.style.setProperty('--text-mid', '#666666');
      root.style.setProperty('--color-accent', '#1e40af');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

// Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg transition-colors bg-gray-100 text-gray-800"
        aria-label="Toggle theme"
        disabled
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors"
      style={{
        backgroundColor: isDark ? '#374151' : '#f3f4f6',
        color: isDark ? '#fafafa' : '#171717',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? '#4b5563' : '#e5e7eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
      }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        // Sun icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}