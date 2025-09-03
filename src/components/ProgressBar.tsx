'use client';

import { useEffect, useState } from 'react';

export function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateProgress = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const progress = (scrollY / (scrollHeight - clientHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    
    // Initial calculation
    updateProgress();
    
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  if (!mounted) {
    return (
      <div 
        className="fixed top-0 left-0 h-0.5 bg-accent z-[100] transition-all duration-150"
        style={{ width: '0%' }}
      />
    );
  }

  return (
    <div 
      className="fixed top-0 left-0 h-0.5 bg-accent z-[100] transition-all duration-150"
      style={{ width: `${progress}%` }}
    />
  );
}