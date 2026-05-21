'use client'

import { TIERS, type BuildTier } from '@/lib/ikazin/tokens'

type TierAvatarProps = {
  name: string
  imageUrl?: string | null
  maxTierEver?: BuildTier | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { outer: 'h-8 w-8', inner: 'h-6 w-6', text: 'text-xs', ring: 2 },
  md: { outer: 'h-10 w-10', inner: 'h-8 w-8', text: 'text-sm', ring: 2 },
  lg: { outer: 'h-14 w-14', inner: 'h-12 w-12', text: 'text-base', ring: 3 },
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TierAvatar({
  name,
  imageUrl,
  maxTierEver,
  size = 'md',
}: TierAvatarProps) {
  const s = sizeMap[size]
  const tierColor = maxTierEver ? TIERS[maxTierEver].color : undefined

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${s.outer}`}
      style={
        tierColor
          ? {
              background: `conic-gradient(${tierColor} 0%, ${tierColor} 75%, transparent 75%)`,
              padding: s.ring,
            }
          : { padding: s.ring, background: '#27272a' }
      }
    >
      <div
        className={`relative flex items-center justify-center rounded-full bg-zinc-800 ${s.inner} overflow-hidden`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={`font-bold text-zinc-300 ${s.text}`}>{initials(name)}</span>
        )}
      </div>

      {maxTierEver && (
        <span
          className="absolute -bottom-0.5 -right-0.5 z-10 rounded-full border border-zinc-900 px-1 py-0.5 text-[8px] font-black leading-none"
          style={{
            background: TIERS[maxTierEver].bgSoft,
            color: TIERS[maxTierEver].textColor,
          }}
          title={`Tier máximo: ${TIERS[maxTierEver].label}`}
        >
          {TIERS[maxTierEver].label[0]}
        </span>
      )}
    </div>
  )
}
