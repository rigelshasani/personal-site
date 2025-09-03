// src/components/DevToolbar.tsx - Development toolbar for better MDX experience
'use client';

import { useState, useEffect } from 'react';

export function DevToolbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastReload, setLastReload] = useState<Date | null>(null);
  
  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
      setLastReload(new Date());
    }
  }, []);

  const refreshContent = () => {
    // Force page reload to refresh content
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs rounded-lg p-2 backdrop-blur-sm border border-gray-600">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>DEV</span>
        </div>
        
        {lastReload && (
          <div className="text-gray-300 dark:text-gray-400">
            Loaded: {lastReload.toLocaleTimeString()}
          </div>
        )}
        
        <button
          onClick={refreshContent}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 dark:bg-green-600 dark:hover:bg-green-500 rounded text-xs transition-colors"
          title="Refresh content"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}