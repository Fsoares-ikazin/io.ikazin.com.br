'use client'

import Link from 'next/link'
import { Play, Clock3 } from 'lucide-react'
import { useParams } from 'next/navigation'

import OnboardingBanner from '@components/ikazin/ui/OnboardingBanner'
import IkazinBadge from '@components/ikazin/ui/IkazinBadge'
import { Button } from '@components/ui/button'
import { color, gradient, tier as tierToken, type BuildTier } from '@/lib/ikazin/tokens'
import { getUriWithOrg } from '@services/config/config'

type HeroBuild = {
  id: string
  buildNumber: number
  title: string
  tier: BuildTier
  thumbnailUrl?: string | null
  durationSeconds?: number | null
  progress: {
    percent: number
    second: number
  }
}

export type HeroContinueCardProps = {
  build: HeroBuild | null
  onPlay: () => void
}

function estimateRemainingMinutes(build: HeroBuild): number | null {
  const elapsed = build.progress.second
  const percent = build.progress.percent

  if (build.durationSeconds && build.durationSeconds > elapsed) {
    return Math.max(1, Math.ceil((build.durationSeconds - elapsed) / 60))
  }

  if (percent <= 0 || elapsed <= 0) return null
  const estimatedTotal = elapsed / (percent / 100)
  const remainingSeconds = estimatedTotal - elapsed

  if (remainingSeconds <= 0) return 1
  return Math.max(1, Math.ceil(remainingSeconds / 60))
}

export default function HeroContinueCard({ build, onPlay }: HeroContinueCardProps) {
  const params = useParams<{ orgslug: string }>()
  const orgslug = params?.orgslug ?? ''

  if (!build) return <OnboardingBanner />

  const t = tierToken(build.tier)
  const remainingMinutes = estimateRemainingMinutes(build)

  return (
    <section className="relative flex min-h-[180px] w-full flex-col overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-900 md:min-h-[280px] lg:flex-row">
      {/* Overlay horizontal — escurece da esquerda */}
      <div className="absolute inset-0" style={{ background: gradient.heroOverlay }} />
      {/* Gradient sutil por tier */}
      <div className="absolute inset-0" style={{ background: gradient.tier(build.tier) }} />

      <div className="relative z-10 flex flex-1 flex-col justify-between px-5 py-5 sm:px-8 sm:py-7">
        <div>
          <IkazinBadge variant="tier" tier={build.tier} size="md" />

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-100 sm:text-[28px]">
            {build.title}
          </h1>

          <div className="mt-3 text-sm font-medium text-zinc-300">
            Build {build.buildNumber}
          </div>

          <div className="mt-4 max-w-xl">
            <div className="h-2 overflow-hidden rounded-full" style={{ background: color.border.subtle }}>
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${build.progress.percent}%`,
                  background: color.primary.DEFAULT,
                  boxShadow: color.primary.glow,
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
              <span>{build.progress.percent}% concluído</span>
              {remainingMinutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" style={{ color: color.primary.text }} />
                  ~{remainingMinutes} min restantes
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={onPlay}
            className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
          >
            ▶ Continuar
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/70 px-5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            <Link href={getUriWithOrg(orgslug, `/build/${build.buildNumber}`)}>Detalhes</Link>
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center px-5 pb-5 sm:px-8 sm:pb-7 lg:w-[42%] lg:pl-0 lg:pr-8 lg:pt-7">
        <div
          className="relative aspect-video w-full overflow-hidden rounded-[18px] border border-zinc-800 shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${color.surface}, ${color.surfaceRaised})` }}
        >
          {build.thumbnailUrl ? (
            <img src={build.thumbnailUrl} alt={build.title} className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: `radial-gradient(circle at top right, ${t.bgSoft}, transparent 40%), linear-gradient(135deg, ${color.surface}, ${color.surfaceRaised})` }}
            >
              <span className="text-5xl font-black tracking-tight text-zinc-700">
                B{build.buildNumber}
              </span>
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 50%)' }}
          />
          <button
            type="button"
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Play build"
          >
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full text-zinc-950 transition-transform hover:scale-105"
              style={{
                background: color.primary.DEFAULT,
                boxShadow: `0 18px 45px ${color.primary.glow}`,
              }}
            >
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
