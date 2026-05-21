'use client'

import { CheckCircle2, Clock } from 'lucide-react'
import IkazinBadge from './IkazinBadge'
import { color, tier as tierToken } from '@/lib/ikazin/tokens'
import type { BuildTier } from '@/lib/ikazin/tokens'

export type { BuildTier }

export type BuildProgress = {
  percent: number
  second: number
  completed: boolean
}

export type BuildStatus = 'locked' | 'in_progress' | 'completed' | 'not_started'

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
  status?: BuildStatus
  /** Se true, a imagem é tratada como above-the-fold (sem lazy). Default: false. */
  priority?: boolean
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

function deriveStatus(locked: boolean, progress?: BuildProgress): BuildStatus {
  if (locked) return 'locked'
  if (progress?.completed) return 'completed'
  if (progress && progress.percent > 0) return 'in_progress'
  return 'not_started'
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
  status,
  priority = false,
}: BuildCardProps) {
  const pct = progress?.percent ?? 0
  const completed = progress?.completed ?? false
  const finalStatus = status ?? deriveStatus(locked, progress)
  const t = tierToken(tier)

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
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-3xl font-black text-zinc-700">B{buildNumber}</span>
          </div>
        )}

        {/* Build number badge — top left */}
        <span
          className="absolute left-2 top-2 rounded-md border px-2 py-0.5 text-xs font-black"
          style={{ borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(6,78,59,0.8)', color: color.primary.text }}
        >
          #{buildNumber}
        </span>

        {/* Tier badge — top right */}
        <div className="absolute right-2 top-2">
          <IkazinBadge variant="tier" tier={tier} />
        </div>

        {/* Progress bar — bottom of thumbnail */}
        {pct > 0 && !locked && (
          <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: color.border.subtle }}>
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{ width: `${pct}%`, background: color.primary.DEFAULT, boxShadow: color.primary.glow }}
            />
          </div>
        )}

        {/* Lock overlay */}
        {finalStatus === 'locked' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-[1px]">
            <IkazinBadge variant="status" status="locked" size="md" />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: t.textColor }}>
              Plano {t.label}
            </span>
          </div>
        )}

        {/* Completed checkmark */}
        {completed && !locked && (
          <div className="absolute bottom-2 right-2">
            <CheckCircle2 className="h-5 w-5 drop-shadow" style={{ color: color.success }} />
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
              className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {durationSeconds && (
          <div className="mt-auto flex items-center gap-1 text-[11px] text-zinc-300">
            <Clock className="h-3 w-3" />
            {formatDuration(durationSeconds)}
          </div>
        )}
      </div>
    </article>
  )
}
