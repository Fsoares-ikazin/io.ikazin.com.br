'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import IkazinBadge from './IkazinBadge'
import { color, gradient, tier as tierToken, type BuildTier } from '@/lib/ikazin/tokens'

export interface RecommendationCardProps {
  build: {
    id: string
    buildNumber: number
    title: string
    tier: BuildTier
    thumbnailUrl?: string | null
  }
  reason?: string
  href: string
  className?: string
}

export default function RecommendationCard({
  build,
  reason,
  href,
  className = '',
}: RecommendationCardProps) {
  const t = tierToken(build.tier)

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-2xl border transition-all hover:scale-[1.005] hover:shadow-lg ${className}`}
      style={{
        borderColor: t.color + '4D',
        background: `${gradient.tier(build.tier)}, ${color.surface}`,
      }}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: t.textColor }}
          >
            Recomendado pra você
          </p>
          <div className="flex items-center gap-2 mb-2">
            <IkazinBadge variant="tier" tier={build.tier} />
            <span className="text-xs font-medium" style={{ color: color.text.muted }}>
              Build {build.buildNumber}
            </span>
          </div>
          <h3 className="text-lg font-bold leading-snug" style={{ color: color.text.primary }}>
            {build.title}
          </h3>
          {reason && (
            <p className="mt-2 text-sm" style={{ color: color.text.secondary }}>
              {reason}
            </p>
          )}
        </div>

        <div
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-transform group-hover:scale-105"
          style={{
            background: color.primary.DEFAULT,
            color: color.bg,
            boxShadow: `0 8px 20px ${color.primary.glow}`,
          }}
        >
          Começar
          <ArrowRight size={16} aria-hidden />
        </div>
      </div>
    </Link>
  )
}
