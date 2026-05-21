'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { color } from '@/lib/ikazin/tokens'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconNode?: React.ReactNode
  cta?: {
    label: string
    href?: string
    onClick?: () => void
  }
  variant?: 'default' | 'compact'
  className?: string
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  iconNode,
  cta,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const padding = variant === 'compact' ? 'py-6 px-4' : 'py-12 px-6'
  const iconSize = variant === 'compact' ? 32 : 48
  const titleClass = variant === 'compact' ? 'text-sm font-semibold' : 'text-lg font-bold'

  const ctaButton = cta ? (
    <span
      className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors hover:opacity-90"
      style={{ background: color.primary.DEFAULT, color: color.bg }}
    >
      {cta.label}
    </span>
  ) : null

  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border text-center ${padding} ${className}`}
      style={{ borderColor: color.border.DEFAULT, background: color.surface }}
    >
      <div style={{ color: color.text.dim }} aria-hidden>
        {iconNode ?? <Icon size={iconSize} strokeWidth={1.5} />}
      </div>
      <h3 className={titleClass} style={{ color: color.text.primary }}>
        {title}
      </h3>
      {description && (
        <p className="max-w-md text-sm" style={{ color: color.text.secondary }}>
          {description}
        </p>
      )}
      {cta && (
        <div className="mt-2">
          {cta.href ? (
            <Link href={cta.href}>{ctaButton}</Link>
          ) : (
            <button type="button" onClick={cta.onClick}>
              {ctaButton}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
