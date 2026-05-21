'use client'

import { useMemo } from 'react'
import { Check, Lock, Play, Sparkles, type LucideIcon } from 'lucide-react'
import { tier as tierToken, color, type BuildTier } from '@/lib/ikazin/tokens'

export type BadgeVariant = 'tier' | 'status' | 'plain'
export type BadgeStatus = 'completed' | 'in_progress' | 'locked' | 'new'

export interface IkazinBadgeProps {
  children?: React.ReactNode
  variant?: BadgeVariant
  tier?: BuildTier
  status?: BadgeStatus
  size?: 'sm' | 'md'
  icon?: LucideIcon
  className?: string
}

const STATUS_DEFAULTS: Record<BadgeStatus, { label: string; icon: LucideIcon; fg: string; bg: string }> = {
  completed:   { label: 'Concluído',  icon: Check,    fg: color.success,        bg: 'rgba(52,211,153,0.12)' },
  in_progress: { label: 'Em progresso', icon: Play,   fg: color.primary.text,   bg: color.primary.soft },
  locked:      { label: 'Bloqueado',  icon: Lock,     fg: color.text.muted,     bg: 'rgba(63,63,70,0.5)' },
  new:         { label: 'Novo',       icon: Sparkles, fg: color.warning,        bg: 'rgba(251,191,36,0.12)' },
}

export default function IkazinBadge({
  children,
  variant = 'plain',
  tier,
  status,
  size = 'sm',
  icon: Icon,
  className = '',
}: IkazinBadgeProps) {
  const computed = useMemo(() => {
    if (variant === 'tier' && tier) {
      const t = tierToken(tier)
      return {
        style: { borderColor: t.color, background: t.bgSoft, color: t.textColor },
        defaultLabel: t.label,
        defaultIcon: null as LucideIcon | null,
        role: undefined,
      }
    }
    if (variant === 'status' && status) {
      const s = STATUS_DEFAULTS[status]
      return {
        style: { borderColor: s.fg, background: s.bg, color: s.fg },
        defaultLabel: s.label,
        defaultIcon: s.icon,
        role: 'status' as const,
      }
    }
    return {
      style: { borderColor: color.border.DEFAULT, background: color.surface, color: color.text.secondary },
      defaultLabel: null,
      defaultIcon: null,
      role: undefined,
    }
  }, [variant, tier, status])

  const sizeClass =
    size === 'sm'
      ? 'text-[10px] px-1.5 py-0.5 gap-1 tracking-wider'
      : 'text-xs px-2 py-1 gap-1.5 tracking-wide'

  const FinalIcon = Icon ?? computed.defaultIcon
  const label = children ?? computed.defaultLabel

  return (
    <span
      role={computed.role}
      className={`inline-flex items-center rounded-md border font-bold uppercase ${sizeClass} ${className}`}
      style={computed.style}
    >
      {FinalIcon && <FinalIcon size={size === 'sm' ? 10 : 12} aria-hidden />}
      {label}
    </span>
  )
}
