'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { trackPublicMarketingEvent } from './PublicMarketingTracker'

type BlogBuildCTAProps = {
  slug: string
  buildNumber: number
  title: string
  tier: 'basic' | 'essentials' | 'advanced' | 'premium'
  duration: string
  variant?: 'inline' | 'footer'
}

const tierStyles = {
  basic: 'border-zinc-600/70 bg-zinc-800/60 text-zinc-300',
  essentials: 'border-blue-700/70 bg-blue-950/60 text-blue-300',
  advanced: 'border-amber-600/70 bg-amber-950/60 text-amber-300',
  premium: 'border-emerald-600/70 bg-emerald-950/60 text-emerald-300',
} as const

export default function BlogBuildCTA({
  slug,
  buildNumber,
  title,
  tier,
  duration,
  variant = 'inline',
}: BlogBuildCTAProps) {
  const href = `/planos#${tier}`

  return (
    <div
      className={[
        'rounded-2xl border border-ikz-border bg-ikz-surface',
        variant === 'inline' ? 'my-8 p-6' : 'p-6 md:p-8',
      ].join(' ')}
    >
      <div className={variant === 'footer' ? 'grid gap-6 md:grid-cols-[0.85fr_1.15fr]' : 'flex flex-col gap-5 md:flex-row md:items-center'}>
        <div className={variant === 'footer' ? 'rounded-2xl border border-ikz-border bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_40%),linear-gradient(135deg,#111827_0%,#0f172a_100%)] aspect-video' : 'hidden'} />

        <div className="flex-1">
          <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${tierStyles[tier]}`}>
            {tier}
          </span>
          <h3 className="mt-4 text-xl font-black text-white">
            Build {buildNumber} — {title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            Quer praticar isso com simulacao real?
          </p>
          {variant === 'footer' ? (
            <p className="mt-3 text-sm leading-7 text-gray-400">
              Duracao estimada: {duration}. Entre no build e leve a teoria para uma simulacao funcional no TIA Portal + RealVirtual.
            </p>
          ) : null}
        </div>

        <div className="shrink-0">
          <Link
            href={href}
            onClick={() => trackPublicMarketingEvent('blog_build_cta_click', {
              slug,
              build_number: buildNumber,
              tier,
              variant,
            })}
            className="inline-flex items-center gap-2 rounded-xl bg-ikz-lime px-5 py-3 text-sm font-bold text-ikz-bg shadow-glow-lime transition-all hover:opacity-90 hover:shadow-glow-lime-lg"
          >
            Ver Build {buildNumber} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
