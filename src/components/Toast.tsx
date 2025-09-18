'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant, timeoutMs?: number) => void;
  success: (message: string, timeoutMs?: number) => void;
  error: (message: string, timeoutMs?: number) => void;
  info: (message: string, timeoutMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = 'info', timeoutMs = 3000) => {
    setCounter((c) => c + 1);
    const id = counter + 1;
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (timeoutMs > 0) {
      setTimeout(() => remove(id), timeoutMs);
    }
  }, [counter, remove]);

  const value = useMemo<ToastContextValue>(() => ({
    show,
    success: (message, ms) => show(message, 'success', ms),
    error: (message, ms) => show(message, 'error', ms),
    info: (message, ms) => show(message, 'info', ms),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Viewport */}
      <div className="fixed z-50 top-4 right-4 space-y-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'rounded-md shadow px-4 py-3 text-sm flex items-start gap-3 border',
              t.variant === 'success' && 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:text-green-200 dark:border-green-900',
              t.variant === 'error' && 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:text-red-200 dark:border-red-900',
              t.variant === 'info' && 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900',
            ].filter(Boolean).join(' ')}
            role="status"
          >
            <div className="flex-1">{t.message}</div>
            <button
              className="opacity-70 hover:opacity-100"
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Provide a safe no-op fallback for environments that do not render the app layout
    // (e.g., isolated component tests). The real app uses ToastProvider in layout.
    const noop = () => {};
    return { show: noop, success: noop, error: noop, info: noop };
  }
  return ctx;
}
