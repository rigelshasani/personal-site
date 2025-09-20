'use client'
import { ViewTrackerWithNotification } from './ViewTrackerWithNotification'

export default function ViewCounter({ slug, className = '' }: { slug: string; className?: string }) {
  return <ViewTrackerWithNotification slug={slug} className={className} />
}