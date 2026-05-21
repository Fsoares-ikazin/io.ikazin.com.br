'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { track } from '@/lib/ikazin/analytics'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { Button } from '@components/ui/button'
import { getUriWithOrg } from '@services/config/config'

type Choice = {
  id: string
  title: string
  description: string
}

type RecommendationPayload = {
  build_id: string | null
  build_number: number
  title: string
  reason: string
}

const PROFILE_OPTIONS: Choice[] = [
  { id: 'student', title: 'Estudante / Estagiário', description: 'Quer entrar na automação com base sólida.' },
  { id: 'professional', title: 'Profissional em ativo', description: 'Precisa aplicar PLC e motion no chão de fábrica.' },
  { id: 'manager', title: 'Gestor de equipe', description: 'Quer acelerar o time com uma trilha prática.' },
]

const EXPERIENCE_OPTIONS: Choice[] = [
  { id: 'never', title: 'Nunca programei', description: 'Partindo do zero com PLC.' },
  { id: 'basic', title: 'Básico (ladder/FBD)', description: 'Já viu lógica básica e quer evoluir.' },
  { id: 'intermediate', title: 'Intermediário', description: 'Já trabalha com PLC e quer aprofundar.' },
  { id: 'advanced', title: 'Avançado (motion/drives)', description: 'Busca casos mais complexos e aplicados.' },
]

const INTEREST_OPTIONS: Choice[] = [
  { id: 'fundamentals', title: 'Fundamentos PLC', description: 'Base forte de lógica, estrutura e raciocínio.' },
  { id: 'drives', title: 'Drives Siemens', description: 'Parametrização e integração com drives.' },
  { id: 'motion', title: 'Motion Control', description: 'Sincronismo, eixos e controle de movimento.' },
  { id: 'robotics', title: 'Robótica industrial', description: 'Aplicações mais avançadas em integração e movimento.' },
]

const BUILD_TITLES: Record<number, string> = {
  1: 'Primeiros passos com PLC e Digital Twin',
  3: 'Estruturas de lógica para sair do básico',
  7: 'Introdução prática a drives Siemens',
  14: 'SINAMICS e aplicações industriais reais',
  15: 'Motion Control na prática',
  16: 'Acoplamento eletrônico e movimento avançado',
  19: 'Robótica e integração industrial avançada',
}

function StepCard({
  option,
  selected,
  onSelect,
}: {
  option: Choice
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'rounded-[20px] border p-5 text-left transition-all',
        selected
          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
          : 'border-zinc-800 bg-[#141a18] hover:border-zinc-700',
      ].join(' ')}
    >
      <h3 className="text-base font-semibold text-zinc-100">{option.title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{option.description}</p>
    </button>
  )
}

export default function WelcomePage({
  params,
}: {
  params: Promise<{ orgslug: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const session = useLHSession() as any
  const status = session?.status ?? 'loading'
  const accessToken = session?.data?.tokens?.access_token

  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<string>()
  const [experience, setExperience] = useState<string>()
  const [interest, setInterest] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [recommendation, setRecommendation] = useState<RecommendationPayload | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login')
    }
  }, [router, status])

  const fallbackRecommendation = useMemo(() => {
    const buildNumber =
      profile === 'student' && experience === 'never' && interest === 'drives'
        ? 7
        : profile === 'student' && experience === 'basic'
          ? 3
          : profile === 'professional' && experience === 'intermediate' && interest === 'drives'
            ? 14
            : profile === 'professional' && experience === 'intermediate' && interest === 'motion'
              ? 15
              : profile === 'professional' && experience === 'advanced' && interest === 'motion'
                ? 16
                : profile === 'professional' && experience === 'advanced' && interest === 'robotics'
                  ? 19
                  : profile === 'manager'
                    ? 14
                    : 1

    return {
      build_id: null,
      build_number: buildNumber,
      title: BUILD_TITLES[buildNumber] ?? `Build ${buildNumber}`,
      reason: 'ele dá a melhor base para começar a trilha.',
    }
  }, [experience, interest, profile])

  useEffect(() => {
    if (status !== 'authenticated') return
    let alive = true

    async function loadSavedRecommendation() {
      try {
        const response = await fetch('/api/v1/ikazin/recommend', {
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
        if (!response.ok) return
        const payload = await response.json()
        if (!alive || !payload?.completed || !payload?.recommendation) return

        setProfile(payload.answers?.profile)
        setExperience(payload.answers?.experience)
        setInterest(payload.answers?.interest)
        setRecommendation(payload.recommendation)
        setDone(true)
        setStep(3)
      } catch {}
    }

    void loadSavedRecommendation()
    return () => {
      alive = false
    }
  }, [accessToken, status])

  async function finishWizard() {
    setSubmitting(true)
    track('welcome_wizard_completed', {
      steps: 3,
      profile,
      experience,
      interest,
    })

    try {
      const response = await fetch('/api/v1/ikazin/recommend', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          profile,
          experience,
          interest,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (response.ok && payload?.recommendation) {
        setRecommendation(payload.recommendation)
      } else {
        setRecommendation(fallbackRecommendation)
      }
    } catch {
      setRecommendation(fallbackRecommendation)
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1500))
    setSubmitting(false)
    setDone(true)
  }

  function skipWizard() {
    router.push(getUriWithOrg(resolvedParams.orgslug, '/dashboard'))
  }

  const dots = [1, 2, 3]
  const resolvedRecommendation = recommendation ?? fallbackRecommendation

  return (
    <main className="min-h-screen bg-[#0a0e0d] text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {dots.map((dot) => (
              <span
                key={dot}
                className={[
                  'h-2.5 w-10 rounded-full transition-colors',
                  dot <= step ? 'bg-emerald-500' : 'bg-zinc-800',
                ].join(' ')}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={skipWizard}
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Pular tudo →
          </button>
        </div>

        {submitting ? (
          <section className="rounded-[24px] border border-zinc-800 bg-[#141a18] px-6 py-16 text-center">
            <h1 className="text-2xl font-bold text-zinc-100">Analisando seu perfil...</h1>
            <p className="mt-3 text-sm text-zinc-400">Ajustando a recomendação inicial da sua trilha.</p>
          </section>
        ) : done ? (
          <section className="overflow-hidden rounded-[24px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_35%),linear-gradient(135deg,_rgba(20,26,24,0.98),_rgba(10,14,13,1))] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
              Build recomendado
            </p>
            <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
                  Build {resolvedRecommendation.build_number}
                </h1>
                <p className="mt-2 text-lg text-zinc-300">{resolvedRecommendation.title}</p>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                  Recomendamos o Build {resolvedRecommendation.build_number} porque {resolvedRecommendation.reason}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
                  >
                    <Link href={getUriWithOrg(resolvedParams.orgslug, `/build/${resolvedRecommendation.build_number}`)}>
                      Começar Build {resolvedRecommendation.build_number} →
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/70 px-5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                  >
                    <Link href={getUriWithOrg(resolvedParams.orgslug, '/catalogo')}>Ver todos os builds</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-[20px] border border-zinc-800 bg-zinc-950/60 p-5">
                <div className="aspect-video rounded-[16px] border border-zinc-800 bg-zinc-900" />
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Motivo</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">
                    Perfil: {profile ?? 'não informado'} · Experiência: {experience ?? 'não informada'} ·
                    {' '}Foco: {interest ?? 'não informado'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[24px] border border-zinc-800 bg-[#141a18] p-6 sm:p-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
              {step === 1 && 'Qual seu perfil?'}
              {step === 2 && 'Experiência com PLC?'}
              {step === 3 && 'O que você quer dominar?'}
            </h1>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {step === 1 && PROFILE_OPTIONS.map((option) => (
                <StepCard
                  key={option.id}
                  option={option}
                  selected={profile === option.id}
                  onSelect={() => {
                    setProfile(option.id)
                    setStep(2)
                  }}
                />
              ))}

              {step === 2 && EXPERIENCE_OPTIONS.map((option) => (
                <StepCard
                  key={option.id}
                  option={option}
                  selected={experience === option.id}
                  onSelect={() => {
                    setExperience(option.id)
                    setStep(3)
                  }}
                />
              ))}

              {step === 3 && INTEREST_OPTIONS.map((option) => (
                <StepCard
                  key={option.id}
                  option={option}
                  selected={interest === option.id}
                  onSelect={() => {
                    setInterest(option.id)
                    void finishWizard()
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
