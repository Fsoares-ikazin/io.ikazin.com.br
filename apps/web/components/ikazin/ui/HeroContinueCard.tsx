'use client'

import Link from 'next/link'
import { Play, Clock3 } from 'lucide-react'
import { useParams } from 'next/navigation'

import OnboardingBanner from '@components/ikazin/ui/OnboardingBanner'
import { Button } from '@components/ui/button'
import { TIER_CONFIG, type BuildTier } from '@/lib/ikazin/constants'
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

  const tier = TIER_CONFIG[build.tier]
  const remainingMinutes = estimateRemainingMinutes(build)

  return (
    <section className="relative flex min-h-[180px] w-full flex-col overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-900 md:min-h-[280px] lg:flex-row">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,14,13,0.96)_0%,rgba(10,14,13,0.88)_42%,rgba(10,14,13,0.4)_68%,rgba(10,14,13,0.15)_100%)]" />

      <div className="relative z-10 flex flex-1 flex-col justify-between px-5 py-5 sm:px-8 sm:py-7">
        <div>
          <span
            className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{
              borderColor: `${tier.color}66`,
              backgroundColor: `${tier.color}1A`,
              color: tier.color,
            }}
          >
            {tier.label}
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-100 sm:text-[28px]">
            {build.title}
          </h1>

          <div className="mt-3 text-sm font-medium text-zinc-400">
            Build {build.buildNumber}
          </div>

          <div className="mt-4 max-w-xl">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${build.progress.percent}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span>{build.progress.percent}% concluído</span>
              {remainingMinutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-emerald-400" />
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
        <div className="relative aspect-video w-full overflow-hidden rounded-[18px] border border-zinc-800 bg-[linear-gradient(135deg,rgba(20,26,24,0.9),rgba(39,39,42,0.85))] shadow-2xl">
          {build.thumbnailUrl ? (
            <img src={build.thumbnailUrl} alt={build.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.24),_transparent_35%),linear-gradient(135deg,_rgba(20,26,24,1),_rgba(39,39,42,1))]">
              <span className="text-5xl font-black tracking-tight text-zinc-700">
                B{build.buildNumber}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <button
            type="button"
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Play build"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/95 text-zinc-950 shadow-[0_18px_45px_rgba(16,185,129,0.35)] transition-transform hover:scale-105">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
