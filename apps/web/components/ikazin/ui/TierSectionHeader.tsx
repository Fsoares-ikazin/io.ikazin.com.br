'use client'

import IkazinBadge from './IkazinBadge'
import { gradient, tier as tierToken, type BuildTier } from '@/lib/ikazin/tokens'

export interface TierSectionHeaderProps {
  tier: BuildTier
  count?: number
  description?: string
  rangeLabel?: string
  className?: string
}

export default function TierSectionHeader({
  tier,
  count,
  description,
  rangeLabel,
  className = '',
}: TierSectionHeaderProps) {
  const t = tierToken(tier)

  return (
    <header
      className={`mb-5 rounded-xl border p-4 sm:p-5 ${className}`}
      style={{
        background: gradient.tier(tier),
        borderColor: t.color + '40',
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <IkazinBadge variant="tier" tier={tier} size="md" />
        {count != null && (
          <span className="text-sm font-medium" style={{ color: t.textColor }}>
            {count} {count === 1 ? 'build' : 'builds'}
          </span>
        )}
        {rangeLabel && (
          <span className="text-sm opacity-80" style={{ color: t.textColor }}>
            {rangeLabel}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm" style={{ color: 'rgba(244,244,245,0.9)' }}>
          {description}
        </p>
      )}
    </header>
  )
}
