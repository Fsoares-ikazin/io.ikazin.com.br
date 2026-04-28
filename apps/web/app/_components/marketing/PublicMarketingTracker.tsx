'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

type EventProperties = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, properties?: EventProperties) => void
    }
    dataLayer?: Record<string, unknown>[]
  }
}

const MARKETING_PREFIXES = ['/', '/blog', '/planos', '/builds']

function isMarketingPath(pathname: string) {
  if (pathname === '/') return true
  return MARKETING_PREFIXES.some((prefix) => prefix !== '/' && pathname.startsWith(prefix))
}

export function trackPublicMarketingEvent(eventName: string, properties: EventProperties = {}) {
  if (typeof window === 'undefined') return

  const payload = {
    path: window.location.pathname,
    ...properties,
  }

  window.umami?.track(eventName, payload)
  window.dataLayer?.push({
    event: eventName,
    ...payload,
  })
}

export function PublicMarketingTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || !isMarketingPath(pathname)) return

    trackPublicMarketingEvent('marketing_page_view', {
      path: pathname,
      referrer: document.referrer || '',
      title: document.title,
      viewport_width: window.innerWidth,
    })
  }, [pathname])

  useEffect(() => {
    if (!pathname || !isMarketingPath(pathname)) return

    const sentDepths = new Set<number>()
    const depths = [25, 50, 75, 100]

    function onScroll() {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return

      const currentDepth = Math.min(100, Math.round((window.scrollY / scrollable) * 100))
      for (const depth of depths) {
        if (currentDepth >= depth && !sentDepths.has(depth)) {
          sentDepths.add(depth)
          trackPublicMarketingEvent('marketing_scroll_depth', {
            path: pathname,
            depth,
          })
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  return null
}
