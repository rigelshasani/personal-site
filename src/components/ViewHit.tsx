'use client'

import { useEffect } from 'react'
import { recordView } from '@/lib/view-counter'

export default function ViewHit({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return
    recordView(slug) // once per session; server sync is de-duped in view-counter.ts
  }, [slug])
  return null
}
