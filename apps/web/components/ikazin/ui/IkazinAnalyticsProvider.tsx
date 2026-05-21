'use client'

import { useEffect, useRef } from 'react'

import { useLHSession } from '@components/Contexts/LHSessionContext'
import { identify } from '@/lib/ikazin/analytics'

type DashboardBootstrap = {
  plan_tier?: string
}

export default function IkazinAnalyticsProvider() {
  const session = useLHSession() as any
  const status = session?.status ?? 'loading'
  const accessToken = session?.data?.tokens?.access_token
  const userId = session?.data?.user?.id
  const identifiedRef = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated' || !userId || identifiedRef.current) return

    let cancelled = false

    async function bootstrap() {
      try {
        const response = await fetch('/api/v1/ikazin/dashboard', {
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
        if (!response.ok) return

        const json = (await response.json()) as DashboardBootstrap
        if (cancelled) return

        const plan = json.plan_tier || 'no_access'
        identify(String(userId), plan, plan)
        identifiedRef.current = true
      } catch {
        // Ignore analytics bootstrap errors
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [accessToken, status, userId])

  return null
}
