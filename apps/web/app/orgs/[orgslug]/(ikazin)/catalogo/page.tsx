'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import BuildCard from '@components/ikazin/ui/BuildCard'
import EmptyState from '@components/ikazin/ui/EmptyState'
import TierSectionHeader from '@components/ikazin/ui/TierSectionHeader'
import BuildCardSkeleton from '@components/ikazin/ui/BuildCardSkeleton'
import { TIERS, type BuildTier } from '@/lib/ikazin/tokens'
import { copy } from '@/lib/ikazin/copy'
import { track } from '@/lib/ikazin/analytics'
import { getPlatformUrl, getUriWithOrg } from '@services/config/config'

// ─── Types ───────────────────────────────────────────────────────────────────

type ApiBuild = {
  id: string
  build_number: number
  title: string
  tier: BuildTier
  tags: string[]
  locked: boolean
  progress: { percent: number; second: number; completed: boolean }
  vimeo_id: string | null
  duration_seconds: number | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TIERS: { value: BuildTier | 'all'; label: string }[] = [
  { value: 'all',        label: 'Todos'      },
  { value: 'basic',      label: 'Basic'      },
  { value: 'essentials', label: 'Essentials' },
  { value: 'advanced',   label: 'Advanced'   },
  { value: 'premium',    label: 'Premium'    },
]

const TIER_ORDER: BuildTier[] = ['basic', 'essentials', 'advanced', 'premium']

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CatalogoPage() {
  const params = useParams<{ orgslug?: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const session = useLHSession() as any

  const [builds, setBuilds] = useState<ApiBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeTier = (searchParams.get('tier') || 'all') as BuildTier | 'all'
  const activeTag  = searchParams.get('tag') || ''

  const status      = session?.status ?? 'loading'
  const accessToken = session?.data?.tokens?.access_token
  const orgslug = typeof params?.orgslug === 'string'
    ? params.orgslug
    : session?.data?.roles?.[0]?.org?.slug || 'default'
  const pricingHref = getPlatformUrl('/planos') ?? '/planos'

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [router, status])

  useEffect(() => {
    if (status !== 'authenticated') return
    let alive = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/v1/ikazin/builds', {
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (alive) setBuilds(json.builds ?? [])
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Erro ao carregar builds')
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => { alive = false }
  }, [status, accessToken])

  const allTags = useMemo(
    () => [...new Set(builds.flatMap((b) => b.tags))].sort(),
    [builds]
  )

  const filtered = useMemo(() => {
    return builds.filter((b) => {
      if (activeTier !== 'all' && b.tier !== activeTier) return false
      if (activeTag && !b.tags.includes(activeTag)) return false
      return true
    })
  }, [builds, activeTier, activeTag])

  const grouped = useMemo(() => {
    const tiers = activeTier === 'all' ? TIER_ORDER : [activeTier as BuildTier]
    return tiers
      .map((tier) => ({ tier, builds: filtered.filter((b) => b.tier === tier) }))
      .filter((g) => g.builds.length > 0)
  }, [filtered, activeTier])

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false })
  }

  const hasFilters = activeTier !== 'all' || !!activeTag
  const hasPaidAccess = useMemo(() => builds.some((build) => !build.locked), [builds])

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-ikz-bg text-ikz-text">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Catálogo de Builds</h1>
          <p className="mt-1 text-sm text-ikz-text-muted">
            {builds.length} builds · PLC + Digital Twin Siemens
          </p>
        </div>

        {!loading && !error && !hasPaidAccess ? (
          <div className="mb-6 rounded-[20px] border border-amber-500/20 bg-amber-500/10 px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-amber-200">Todos os builds estão bloqueados no momento</h2>
                <p className="mt-1 text-sm text-amber-100/75">
                  Ative um plano para liberar sua trilha, continuar do dashboard e acessar os materiais.
                </p>
              </div>
              <a
                href={pricingHref}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                Ver planos
              </a>
            </div>
          </div>
        ) : null}

        {/* Tier tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {TIERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setParam('tier', value === 'all' ? '' : value)}
              className={[
                'rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all',
                activeTier === value
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-ikz-border bg-ikz-surface text-ikz-text-muted hover:border-zinc-600',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setParam('tag', activeTag === tag ? '' : tag)}
                className={[
                  'rounded-md border px-2 py-0.5 text-xs font-medium transition-all',
                  activeTag === tag
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                    : 'border-ikz-border bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300',
                ].join(' ')}
              >
                {tag}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-0.5 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3 w-3" /> limpar
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Skeleton grid */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <BuildCardSkeleton key={i} inGrid />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="Nenhum build com esses filtros"
            description="Tente outro termo ou limpe os filtros."
            cta={{ label: 'Limpar filtros', onClick: clearFilters }}
            className="my-12"
          />
        )}

        {/* Tier sections */}
        {!loading && !error && grouped.map(({ tier, builds: tierBuilds }) => {
          const [from, to] = TIERS[tier].range
          return (
            <section key={tier} className="mb-10">
              <TierSectionHeader
                tier={tier}
                count={tierBuilds.length}
                rangeLabel={`Builds ${from}–${to}`}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tierBuilds.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      track('build_opened', {
                        build_id: b.id,
                        build_number: b.build_number,
                        tier: b.tier,
                        locked: b.locked,
                        source_row: 'catalogo',
                      })
                      if (!b.locked) router.push(getUriWithOrg(orgslug, `/build/${b.build_number}`))
                      else router.push(pricingHref)
                    }}
                  >
                    <BuildCard
                      id={b.id}
                      buildNumber={b.build_number}
                      title={b.title}
                      tier={b.tier}
                      tags={b.tags}
                      locked={b.locked}
                      progress={b.progress}
                      thumbnailUrl={undefined}
                      durationSeconds={b.duration_seconds}
                    />
                    {b.locked && (
                      <p className="mt-1 text-center text-xs text-zinc-400">
                        {copy.tier.locked(TIERS[b.tier].label)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        })}

      </div>
    </div>
  )
}
