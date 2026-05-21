'use client'

import { Lock, CheckCircle2, Clock } from 'lucide-react'

export type BuildTier = 'basic' | 'essentials' | 'advanced' | 'premium'

export type BuildProgress = {
  percent: number
  second: number
  completed: boolean
}

export type BuildCardProps = {
  id: string
  buildNumber: number
  title: string
  tier: BuildTier
  tags: string[]
  locked: boolean
  progress?: BuildProgress
  thumbnailUrl?: string
  durationSeconds?: number | null
}

const TIER_BADGE: Record<BuildTier, string> = {
  basic:      'border-zinc-600 bg-zinc-800/70 text-zinc-300',
  essentials: 'border-blue-700/70 bg-blue-950/60 text-blue-300',
  advanced:   'border-amber-600/70 bg-amber-950/60 text-amber-300',
  premium:    'border-purple-600/70 bg-purple-950/60 text-purple-300',
}

const TIER_LABEL: Record<BuildTier, string> = {
  basic:      'Basic',
  essentials: 'Essentials',
  advanced:   'Advanced',
  premium:    'Premium',
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export default function BuildCard({
  buildNumber,
  title,
  tier,
  tags,
  locked,
  progress,
  thumbnailUrl,
  durationSeconds,
}: BuildCardProps) {
  const pct = progress?.percent ?? 0
  const completed = progress?.completed ?? false

  return (
    <article
      className={[
        'group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-150',
        'border-ikz-border bg-ikz-surface',
        locked
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_0_18px_rgba(16,185,129,0.15)]',
      ].join(' ')}
    >
      {/* Thumbnail / 16:9 */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-3xl font-black text-zinc-700">B{buildNumber}</span>
          </div>
        )}

        {/* Build number badge — top left */}
        <span className="absolute left-2 top-2 rounded-md border border-emerald-500/40 bg-emerald-950/80 px-2 py-0.5 text-xs font-black text-emerald-400">
          #{buildNumber}
        </span>

        {/* Tier badge — top right */}
        <span className={`absolute right-2 top-2 rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${TIER_BADGE[tier]}`}>
          {TIER_LABEL[tier]}
        </span>

        {/* Progress bar — bottom of thumbnail */}
        {pct > 0 && !locked && (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-zinc-800">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 backdrop-blur-[1px]">
            <Lock className="h-6 w-6 text-zinc-400" />
          </div>
        )}

        {/* Completed checkmark */}
        {completed && !locked && (
          <div className="absolute bottom-2 right-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 drop-shadow" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="text-sm font-bold leading-snug text-zinc-100 transition-colors group-hover:text-emerald-400">
          {title}
        </h3>

        <div className="flex flex-wrap gap-1">
          {(tags || []).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {durationSeconds && (
          <div className="mt-auto flex items-center gap-1 text-[11px] text-zinc-500">
            <Clock className="h-3 w-3" />
            {formatDuration(durationSeconds)}
          </div>
        )}
      </div>
    </article>
  )
}
