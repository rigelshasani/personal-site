'use client'
import { useEffect, useRef, useState } from 'react'
import { getViewCount, formatViewCount, recordView } from '@/lib/view-counter'

type BaseProps = { slug: string; className?: string }

export function ViewCount({ slug, className = '' }: BaseProps) {
  const [count, setCount] = useState(() => (slug ? getViewCount(slug) : 0))
  const last = useRef<number>(count)

  useEffect(() => {
    if (!slug) return
    // initial refresh (server fetch is de-duped + TTL inside getViewCount)
    const c = getViewCount(slug)
    setCount(c)
    last.current = c
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== 'blog-view-counts') return
      const next = getViewCount(slug)
      if (next !== last.current) {
        last.current = next
        setCount(next)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [slug])

  if (!slug || count === 0) return null

  return (
    <span className={`inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {/* icon shown by parent when needed */}
      <span className="transition-all duration-500 ">{formatViewCount(count)}</span>
    </span>
  )
}

export function ViewTracker({ slug, className = '' }: BaseProps) {
  const [count, setCount] = useState(() => (slug ? getViewCount(slug) : 0))
  const timer = useRef<number | null>(null)
  const last = useRef<number>(count)

  useEffect(() => {
    if (!slug) return
    const c = getViewCount(slug)
    setCount(c)
    last.current = c
    // schedule a single increment after 5s
    timer.current = window.setTimeout(() => {
      const next = recordView(slug)
      last.current = next
      setCount(next)
    }, 5000)

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== 'blog-view-counts') return
      const next = getViewCount(slug)
      if (next !== last.current) {
        last.current = next
        setCount(next)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      if (timer.current) clearTimeout(timer.current)
      window.removeEventListener('storage', onStorage)
    }
  }, [slug])

  if (!slug || count === 0) return null

  return (
    <span className={`inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <svg
        aria-hidden="true"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      <span className="transition-all duration-500 ">{formatViewCount(count)}</span>
    </span>
  )
}

export default function ViewCounter({
  slug,
  className = '',
  showIcon = true,
  shouldRecord = false,
}: BaseProps & { showIcon?: boolean; shouldRecord?: boolean }) {
  const [count, setCount] = useState(() => (slug ? getViewCount(slug) : 0))
  const last = useRef<number>(count)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!slug) return
    const c = getViewCount(slug)
    setCount(c)
    last.current = c
    if (shouldRecord) {
      timer.current = window.setTimeout(() => {
        const next = recordView(slug)
        last.current = next
        setCount(next)
      }, 5000)
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== 'blog-view-counts') return
      const next = getViewCount(slug)
      if (next !== last.current) {
        last.current = next
        setCount(next)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      if (timer.current) clearTimeout(timer.current)
      window.removeEventListener('storage', onStorage)
    }
  }, [slug, shouldRecord])

  if (!slug || count === 0) return null

  return (
    <span className={`inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 transition-all duration-500  ${className}`}>
      {showIcon && (
        <svg
          aria-hidden="true"
          className="w-4 h-4 transition-all duration-500 "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      )}
      <span className="transition-all duration-500 ">{formatViewCount(count)}</span>
    </span>
  )
}
