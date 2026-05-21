'use client'

import { useMemo } from 'react'
import { color, tier as tierToken, type BuildTier } from '@/lib/ikazin/tokens'

/* ─────────────────────────────────────────────────────────────────────── */
/* ProgressLine — barra horizontal animada                                 */
/* ─────────────────────────────────────────────────────────────────────── */

export interface ProgressLineProps {
  value: number              // 0-100
  height?: number            // px, default 4
  tier?: BuildTier           // colore com tokens.tiers[t]
  showLabel?: boolean
  className?: string
  trackColor?: string
}

export function ProgressLine({
  value,
  height = 4,
  tier,
  showLabel = false,
  className = '',
  trackColor,
}: ProgressLineProps) {
  const pct = Math.max(0, Math.min(100, value))
  const fillColor = tier ? tierToken(tier).color : color.primary.DEFAULT
  const glow = tier ? tierToken(tier).glow : color.primary.glow

  return (
    <div className={`w-full ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full overflow-hidden rounded-full"
        style={{
          height: `${height}px`,
          background: trackColor ?? color.border.subtle,
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: fillColor,
            boxShadow: `0 0 8px ${glow}`,
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 text-xs font-medium" style={{ color: color.text.secondary }}>
          {Math.round(pct)}%
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────── */
/* ProgressCircle — circular SVG                                           */
/* ─────────────────────────────────────────────────────────────────────── */

export interface ProgressCircleProps {
  value: number              // 0-100
  size?: number              // px, default 64
  strokeWidth?: number       // px, default 6
  tier?: BuildTier
  label?: React.ReactNode    // texto no centro
  className?: string
}

export function ProgressCircle({
  value,
  size = 64,
  strokeWidth = 6,
  tier,
  label,
  className = '',
}: ProgressCircleProps) {
  const pct = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const { fillColor, glow } = useMemo(() => {
    if (tier) {
      const t = tierToken(tier)
      return { fillColor: t.color, glow: t.glow }
    }
    return { fillColor: color.primary.DEFAULT, glow: color.primary.glow }
  }, [tier])

  const offset = useMemo(
    () => circumference - (pct / 100) * circumference,
    [circumference, pct],
  )

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.border.subtle}
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)',
            filter: `drop-shadow(0 0 4px ${glow})`,
          }}
        />
      </svg>
      {label && (
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color: color.text.primary }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Default export — namespace-friendly                                     */
/* ─────────────────────────────────────────────────────────────────────── */

const IkazinProgress = { Line: ProgressLine, Circle: ProgressCircle }
export default IkazinProgress
