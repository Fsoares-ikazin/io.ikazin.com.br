'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, CheckCircle2 } from 'lucide-react'

import { useLHSession } from '@components/Contexts/LHSessionContext'
import BuildVideoPlayer from '@components/ikazin/ui/BuildVideoPlayer'
import MaterialsList, { StickyDownloadBar } from '@components/ikazin/ui/MaterialsList'
import NextBuildCompactCard from '@components/ikazin/ui/NextBuildCompactCard'
import IkazinBadge from '@components/ikazin/ui/IkazinBadge'
import { ProgressLine } from '@components/ikazin/ui/IkazinProgress'
import { Button } from '@components/ui/button'
import { track } from '@/lib/ikazin/analytics'
import { TIERS, color, type BuildTier } from '@/lib/ikazin/tokens'
import { getPlatformUrl, getUriWithOrg } from '@services/config/config'

type BuildDetailResponse = {
  build: {
    id: string
    build_number: number
    title: string
    description: string
    tier: BuildTier
    tags: string[]
    locked: boolean
    vimeo_id: string | null
    video_provider: 'minio_hls'
    playback_url: string | null
    materials: Array<{
      type: 'exe' | 'zip' | 'pdf' | 'scl'
      label: string
      available: boolean
    }>
    next_build: {
      id: string
      build_number: number
      title: string
      tier: BuildTier
    } | null
    progress: {
      percent: number
      second: number
      completed: boolean
    }
    viewer?: {
      seconds_since_signup: number | null
    }
  }
}

function BuildPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#0a0e0d] text-zinc-100">
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <div className="aspect-video rounded-[18px] bg-zinc-900" />
            <div className="space-y-3">
              <div className="h-8 w-2/3 rounded bg-zinc-900" />
              <div className="h-4 w-40 rounded bg-zinc-900" />
              <div className="h-20 w-full rounded bg-zinc-900" />
            </div>
          </div>
          <div className="h-[420px] rounded-[20px] bg-zinc-900" />
        </div>
      </div>
    </main>
  )
}

export default function BuildDetailPage({
  params,
}: {
  params: Promise<{ id: string; orgslug: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const session = useLHSession() as any
  const status = session?.status ?? 'loading'
  const accessToken = session?.data?.tokens?.access_token

  const [data, setData] = useState<BuildDetailResponse['build'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMaterialsOpen, setMobileMaterialsOpen] = useState(false)
  const [showCompletionState, setShowCompletionState] = useState(false)
  const pricingHref = getPlatformUrl('/planos') ?? '/planos'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login')
    }
  }, [router, status])

  useEffect(() => {
    if (status !== 'authenticated') return
    let alive = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/v1/ikazin/builds/${resolvedParams.id}`, {
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = (await response.json()) as BuildDetailResponse

        if (alive) {
          track('build_opened', {
            build_id: json.build.id,
            build_number: json.build.build_number,
            tier: json.build.tier,
            locked: json.build.locked,
            source_row: 'build_page',
          })
          if ((json.build.progress.percent ?? 0) === 0) {
            const firstBuildKey = `ikazin:first-build-opened:${session?.data?.user?.id ?? 'anon'}`
            if (typeof window !== 'undefined' && !window.localStorage.getItem(firstBuildKey)) {
              window.localStorage.setItem(firstBuildKey, json.build.id)
              track('first_build_opened', {
                build_id: json.build.id,
                seconds_since_signup: json.build.viewer?.seconds_since_signup ?? null,
              })
            }
          }
          setData(json.build)
          setShowCompletionState(Boolean(json.build.progress.completed))
        }
      } catch (fetchError) {
        if (alive) {
          setError(fetchError instanceof Error ? fetchError.message : 'Erro ao carregar build')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [accessToken, resolvedParams.id, status])

  async function markAsCompleted() {
    if (!data) return

    try {
      const response = await fetch(`/api/v1/ikazin/progress/${data.id}/complete`, {
        method: 'PUT',
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      track('build_marked_complete', {
        build_id: data.id,
      })
      setData((current) =>
        current
          ? {
              ...current,
              progress: { ...current.progress, percent: 100, completed: true },
            }
          : current
      )
      setShowCompletionState(true)
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : 'Erro ao concluir build')
    }
  }

  if (status === 'loading' || loading) return <BuildPageSkeleton />

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0a0e0d] text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-900/80 bg-red-950/40 px-5 py-4 text-sm text-red-300">
            {error ?? 'Build nao encontrado'}
          </div>
        </div>
      </main>
    )
  }

  const t = TIERS[data.tier]

  if (data.locked) {
    return (
      <main className="min-h-screen text-zinc-100" style={{ background: color.bg }}>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-[24px] border border-amber-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_35%),linear-gradient(135deg,_rgba(20,26,24,0.98),_rgba(10,14,13,1))] p-6 sm:p-8">
            <IkazinBadge variant="status" status="locked" size="md">
              Build bloqueado
            </IkazinBadge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-100">
              Build {data.build_number} — {data.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">
              Este build faz parte do plano <span className="font-semibold text-zinc-100">{t.label}</span>.
              {' '}Ative ou amplie seu acesso para assistir ao vídeo, liberar materiais e continuar a trilha.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                <Link href={pricingHref}>Ver planos</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/70 px-5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                <Link href={getUriWithOrg(resolvedParams.orgslug, '/catalogo')}>Voltar ao catálogo</Link>
              </Button>
            </div>
          </section>

          <section className="mt-6 rounded-[20px] border border-zinc-800 bg-[#141a18] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Descricao
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {data.description || 'Descricao do build em preparacao.'}
            </p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-24 text-zinc-100 lg:pb-0" style={{ background: color.bg }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <div className="sticky top-16 z-20 lg:static">
              <BuildVideoPlayer
                buildId={data.id}
                buildNumber={data.build_number}
                title={data.title}
                tier={data.tier}
                playbackUrl={data.playback_url}
                accessToken={accessToken}
                onCompleted={() => {
                  setShowCompletionState(true)
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          progress: { ...current.progress, percent: 100, completed: true },
                        }
                      : current
                  )
                }}
              />
            </div>

            <section className="rounded-[20px] border border-zinc-800 bg-[#141a18] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <IkazinBadge variant="tier" tier={data.tier} size="md" />
                  <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
                    Build {data.build_number} — {data.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => void markAsCompleted()}
                  className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marquei como concluido
                </Button>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/55 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-300">Progresso atual</span>
                  <span className="text-sm text-zinc-300">{data.progress.percent}%</span>
                </div>
                <ProgressLine value={data.progress.percent} height={8} tier={data.tier} />
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Descricao
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {data.description || 'Descricao do build em preparacao.'}
                </p>
              </div>
            </section>

            <NextBuildCompactCard
              orgslug={resolvedParams.orgslug}
              nextBuild={data.next_build}
              emphasized={showCompletionState}
            />
          </div>

          <aside className="hidden lg:block">
            <MaterialsList buildId={data.id} materials={data.materials} accessToken={accessToken} />
          </aside>
        </div>

        <section className="mt-6 lg:hidden">
          <div className="overflow-hidden rounded-[20px] border border-zinc-800 bg-[#141a18]">
            <button
              type="button"
              onClick={() => setMobileMaterialsOpen((value) => !value)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Materiais</h2>
                <p className="mt-1 text-sm text-zinc-500">Arquivos deste build</p>
              </div>
              <ChevronDown
                className={[
                  'h-5 w-5 text-zinc-400 transition-transform',
                  mobileMaterialsOpen ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {mobileMaterialsOpen ? (
              <div className="border-t border-zinc-800 p-5">
                <MaterialsList buildId={data.id} materials={data.materials} compact accessToken={accessToken} />
              </div>
            ) : null}
          </div>
        </section>

        {showCompletionState && data.next_build ? (
          <div className="mt-6 rounded-[20px] border border-emerald-500/25 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
            Build concluido. Proximo passo:
            {' '}
            <Link
              href={getUriWithOrg(resolvedParams.orgslug, `/build/${data.next_build.build_number}`)}
              className="font-semibold text-emerald-300 hover:text-emerald-200"
            >
              abrir Build {data.next_build.build_number}
            </Link>
          </div>
        ) : null}
      </div>

      <StickyDownloadBar hasDownloadableMaterials={data.materials.some((item) => item.available && item.type !== 'scl')} />
    </main>
  )
}
