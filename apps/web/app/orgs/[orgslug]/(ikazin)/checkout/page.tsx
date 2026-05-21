'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLHSession } from '@components/Contexts/LHSessionContext'

const VALID_PLANS = ['basic', 'essentials', 'advanced', 'premium'] as const
type Plan = (typeof VALID_PLANS)[number]

const PLAN_LABELS: Record<Plan, string> = {
  basic: 'BASIC',
  essentials: 'ESSENTIALS',
  advanced: 'ADVANCED',
  premium: 'PREMIUM',
}

export default function CheckoutPage({ params }: { params: Promise<{ orgslug: string }> }) {
  use(params) // resolve params (orgslug not needed, but required by Next.js)
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useLHSession() as any
  const [error, setError] = useState<string | null>(null)

  const plan = (searchParams.get('plan') ?? '').toLowerCase() as Plan

  useEffect(() => {
    if (!plan || !VALID_PLANS.includes(plan)) {
      router.replace('/planos')
      return
    }

    // session not yet hydrated
    if (session === undefined || session === null) return

    if (!session?.data?.tokens?.access_token) {
      const next = encodeURIComponent(`/checkout?plan=${plan}`)
      router.replace(`/auth/login?next=${next}`)
      return
    }

    const accessToken: string = session.data.tokens.access_token

    const go = async () => {
      try {
        const res = await fetch('/api/v1/ikazin/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ plan }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.detail ?? 'Erro ao iniciar o checkout. Tente novamente.')
          return
        }

        const { session_url } = await res.json()
        window.location.href = session_url
      } catch {
        setError('Erro de conexão. Verifique sua internet e tente novamente.')
      }
    }

    go()
  }, [plan, session, router])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ikz-bg text-white">
        <p className="max-w-sm text-center text-sm text-red-400">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ikz-bg text-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ikz-lime border-t-transparent" />
      <p className="text-sm text-gray-400">
        {plan && VALID_PLANS.includes(plan)
          ? `Iniciando checkout do plano ${PLAN_LABELS[plan]}…`
          : 'Redirecionando…'}
      </p>
    </div>
  )
}
