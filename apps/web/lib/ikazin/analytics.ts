'use client'

import posthog from 'posthog-js'

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

let initialized = false

function ensurePosthog() {
  if (initialized || typeof window === 'undefined' || !POSTHOG_KEY) return

  posthog.init(POSTHOG_KEY, {
    api_host: 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: false,
    persistence: 'localStorage+cookie',
    person_profiles: 'identified_only',
  })
  initialized = true
}

export function track(event: string, props?: Record<string, any>) {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return
  ensurePosthog()
  posthog.capture(event, props)
}

export function identify(userId: string, plan: string, tier: string) {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return
  ensurePosthog()
  posthog.identify(userId, { plan, tier })
}
