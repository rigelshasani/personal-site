// src/hooks/useViewCounter.ts
'use client'
import { useEffect, useRef, useState } from 'react'
import { getViewCount, formatViewCount } from '@/lib/view-counter'

export function useViewCounter(slug: string) {
  const [viewCount, setViewCount] = useState(() => getViewCount(slug))
  const [justIncremented, setJustIncremented] = useState(false)
  const last = useRef<number>(viewCount)

  useEffect(() => {
    const c = getViewCount(slug)
    setViewCount(c)
    last.current = c

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
    return () => window.removeEventListener('storage', onStorage)
  }, [slug])

  return { viewCount, formattedViewCount: formatViewCount(viewCount), justIncremented }
}

// Read-only version (alias for compatibility with ViewCounter component)
export const useViewCountDisplay = useViewCounter
