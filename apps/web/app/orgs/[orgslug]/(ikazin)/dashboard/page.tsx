'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useLHSession } from '@components/Contexts/LHSessionContext'
import HeroContinueCard from '@components/ikazin/ui/HeroContinueCard'
import HorizontalRow from '@components/ikazin/ui/HorizontalRow'
import RecommendationCard from '@components/ikazin/ui/RecommendationCard'
import { ProgressCircle } from '@components/ikazin/ui/IkazinProgress'
import type { BuildCardProps, BuildTier } from '@components/ikazin/ui/BuildCard'
import { track } from '@/lib/ikazin/analytics'
import { TIERS, color } from '@/lib/ikazin/tokens'
import { copy } from '@/lib/ikazin/copy'
import { greetingNow, progressNarrative, deriveProgressState } from '@/lib/ikazin/narratives'
import { getPlatformUrl, getUriWithOrg } from '@services/config/config'

type DashboardBuild = BuildCardProps & {
  vimeo_id: string | null
  duration_seconds?: number | null
  thumbnail_url?: string | null
}

type DashboardResponse = {
  last_accessed: DashboardBuild | null
  in_progress: DashboardBuild[]
  plan_builds: DashboardBuild[]
  recently_added: DashboardBuild[]
  suggested_next: DashboardBuild | null
  plan_tier?: BuildTier
}

function HeroSkeleton() {
  return (
    <div className="min-h-[180px] animate-pulse overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-900 md:min-h-[280px]">
      <div className="grid h-full gap-4 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-7">
        <div className="flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="h-6 w-24 rounded-full bg-zinc-800" />
            <div className="h-8 w-3/4 rounded bg-zinc-800" />
            <div className="h-4 w-24 rounded bg-zinc-800" />
            <div className="h-2 w-full rounded-full bg-zinc-800" />
            <div className="h-4 w-40 rounded bg-zinc-800" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-36 rounded-xl bg-zinc-800" />
            <div className="h-11 w-28 rounded-xl bg-zinc-800" />
          </div>
        </div>
        <div className="hidden h-full items-center lg:flex">
          <div className="aspect-video w-full rounded-[18px] bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}

function RowSkeleton({ title }: { title: string }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-40 rounded bg-zinc-800" />
        <div className="h-4 w-20 rounded bg-zinc-800" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`${title}-${index}`}
            className="w-[78vw] shrink-0 animate-pulse overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 sm:w-[280px] lg:w-[300px]"
          >
            <div className="aspect-video w-full bg-zinc-800" />
            <div className="space-y-3 p-3">
              <div className="h-4 w-3/4 rounded bg-zinc-800" />
              <div className="h-3 w-1/2 rounded bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function mapBuild(build: DashboardBuild | null): DashboardBuild | null {
  if (!build) return null

  return {
    ...build,
    durationSeconds: build.duration_seconds ?? null,
    thumbnailUrl: build.thumbnail_url ?? undefined,
  }
}

function mapBuilds(builds: DashboardBuild[]): DashboardBuild[] {
  return builds.map((build) => ({
    ...build,
    durationSeconds: build.duration_seconds ?? null,
    thumbnailUrl: build.thumbnail_url ?? undefined,
  }))
}

export default function DashboardPage({
  params,
}: {
  params: Promise<{ orgslug: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const session = useLHSession() as any
  const status = session?.status ?? 'loading'
  const accessToken = session?.data?.tokens?.access_token
  const pricingHref = getPlatformUrl('/planos') ?? '/planos'

  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        const response = await fetch('/api/v1/ikazin/dashboard', {
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = (await response.json()) as DashboardResponse

        if (alive) {
          track('dashboard_viewed', {
            plan: json.plan_tier ?? 'no_access',
          })
          if (!json.last_accessed && !(json.in_progress ?? []).length) {
            track('aha_opportunity', {
              plan: json.plan_tier ?? 'no_access',
            })
          }
          setData({
            ...json,
            last_accessed: mapBuild(json.last_accessed),
            in_progress: mapBuilds(json.in_progress ?? []),
            plan_builds: mapBuilds(json.plan_builds ?? []),
            recently_added: mapBuilds(json.recently_added ?? []),
            suggested_next: mapBuild(json.suggested_next),
          })
        }
      } catch (fetchError) {
        if (alive) {
          setError(fetchError instanceof Error ? fetchError.message : 'Erro ao carregar dashboard')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [status, accessToken])

  const planLabel = data?.plan_tier ? TIERS[data.plan_tier].label.toUpperCase() : 'SEM PLANO'

  const userName: string =
    session?.data?.user?.first_name ||
    session?.data?.user?.username ||
    'engenheiro'

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen text-zinc-100" style={{ background: color.bg }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <HeroSkeleton />
          <RowSkeleton title="continue" />
          <RowSkeleton title="plan" />
          <RowSkeleton title="recent" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen text-zinc-100" style={{ background: color.bg }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-900/80 bg-red-950/40 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        </div>
      </main>
    )
  }

  const lastAccessed = data?.last_accessed ?? null
  const inProgress = data?.in_progress ?? []
  const planBuilds = data?.plan_builds ?? []
  const recentlyAdded = data?.recently_added ?? []
  const completedBuildNumbers = [...inProgress, ...planBuilds]
    .filter((b) => b.progress?.completed)
    .map((b) => b.buildNumber)
  const progressState = deriveProgressState(completedBuildNumbers, data?.plan_tier ?? null)
  const narrative = progressNarrative(progressState)

  return (
    <main className="min-h-screen text-zinc-100" style={{ background: color.bg }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              {greetingNow(userName)}
            </h1>
            <p className="mt-1 text-sm text-zinc-300">{narrative}</p>
          </div>
          {progressState.tier && progressState.totalInTier > 0 && (
            <div className="hidden sm:block">
              <ProgressCircle
                value={(progressState.completedInTier / progressState.totalInTier) * 100}
                size={72}
                strokeWidth={6}
                tier={progressState.tier}
                label={`${progressState.completedInTier}/${progressState.totalInTier}`}
              />
            </div>
          )}
        </header>

        {!data?.plan_tier ? (
          <section className="rounded-[20px] border border-amber-500/20 bg-amber-500/10 px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-amber-200">Seu acesso ainda não está ativo</h2>
                <p className="mt-1 text-sm text-amber-100/75">
                  Escolha um plano para liberar os builds, o player e os materiais da trilha.
                </p>
              </div>
              <a
                href={pricingHref}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                Ver planos
              </a>
            </div>
          </section>
        ) : null}

        <HeroContinueCard
          build={
            lastAccessed
              ? {
                  id: lastAccessed.id,
                  buildNumber: lastAccessed.buildNumber,
                  title: lastAccessed.title,
                  tier: lastAccessed.tier,
                  thumbnailUrl: lastAccessed.thumbnailUrl,
                  durationSeconds: lastAccessed.durationSeconds,
                  progress: lastAccessed.progress ?? { percent: 0, second: 0 }
                }
              : null
          }
          onPlay={() => {
            if (!lastAccessed) return
            track('build_opened', {
              build_id: lastAccessed.id,
              build_number: lastAccessed.buildNumber,
              tier: lastAccessed.tier,
              locked: false,
              source_row: 'hero_continue',
            })
            router.push(getUriWithOrg(resolvedParams.orgslug, `/build/${lastAccessed.buildNumber}`))
          }}
        />

        {data?.suggested_next ? (
          <RecommendationCard
            build={{
              id: data.suggested_next.id,
              buildNumber: data.suggested_next.buildNumber,
              title: data.suggested_next.title,
              tier: data.suggested_next.tier,
              thumbnailUrl: data.suggested_next.thumbnailUrl,
            }}
            reason={
              lastAccessed
                ? `Continuação natural depois de "${lastAccessed.title}".`
                : 'Comece pela peça que destrava sua trilha.'
            }
            href={getUriWithOrg(resolvedParams.orgslug, `/build/${data.suggested_next.buildNumber}`)}
          />
        ) : null}

        <HorizontalRow
          title="Continue assistindo"
          builds={inProgress}
          emptyMessage={copy.empty.horizontalRow.noProgress}
        />

        <HorizontalRow
          title={`Seu plano: ${planLabel}`}
          builds={planBuilds}
          emptyMessage={copy.empty.horizontalRow.generic}
        />

        <HorizontalRow
          title="Adicionados recentemente"
          builds={recentlyAdded}
          emptyMessage="Nenhum build novo por enquanto."
        />
      </div>
    </main>
  )
}
