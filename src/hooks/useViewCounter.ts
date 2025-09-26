// src/hooks/useViewCounter.ts
'use client'
import { useEffect, useRef, useState } from 'react'
import { getViewCount, formatViewCount, recordView } from '@/lib/view-counter'

export function useViewCounter(slug: string) {
  const [viewCount, setViewCount] = useState(() => (slug ? getViewCount(slug) : 0))
  const [justIncremented, setJustIncremented] = useState(false)
  const timer = useRef<number | null>(null)
  const last = useRef<number>(viewCount)

  useEffect(() => {
    if (!slug) return

    const c = getViewCount(slug)
    setViewCount(c)
    last.current = c

    // Schedule view recording after 5 seconds
    timer.current = window.setTimeout(() => {
      try {
        const next = recordView(slug)
        last.current = next
        setViewCount(next)
        setJustIncremented(true)
        setTimeout(() => setJustIncremented(false), 1500)
      } catch (error) {
        // Silently handle errors in production, but let tests catch them
        if (process.env.NODE_ENV === 'test') {
          throw error
        }
        console.error('Failed to record view:', error)
      }
    }, 5000)

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== 'blog-view-counts') return
      const next = getViewCount(slug)
      if (next > last.current) {
        setJustIncremented(true)
        setTimeout(() => setJustIncremented(false), 1500)
      }
      last.current = next
      setViewCount(next)
    }
    window.addEventListener('storage', onStorage)
    return () => {
      if (timer.current) clearTimeout(timer.current)
      window.removeEventListener('storage', onStorage)
    }
  }, [slug])

  return { viewCount, formattedViewCount: formatViewCount(viewCount), justIncremented }
}

// Read-only version (alias for compatibility with ViewCounter component)
export const useViewCountDisplay = useViewCounter
