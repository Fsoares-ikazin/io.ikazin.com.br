import Link from 'next/link'
import { Check } from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'

export type TierCardData = {
  label: string
  price: string
  builds: string
  audience: string
  features: string[]
  style: {
    badge: string
    border: string
    cta: 'primary' | 'outline'
    featured?: boolean
  }
}

type TierCardProps = {
  tier: TierCardData
  ctaPrefix: string
  priceNote: string
  mostPopular: string
  isCurrentPlan?: boolean
}

export function TierCard({ tier, ctaPrefix, priceNote, mostPopular, isCurrentPlan }: TierCardProps) {
  const session = useLHSession() as any
  const isAuth = session?.status === 'authenticated'
  const planSlug = tier.label.toLowerCase()
  // If user already owns this plan, go to dashboard — no re-purchase
  const href = isCurrentPlan
    ? '/dashboard'
    : isAuth
      ? `/checkout?plan=${planSlug}`
      : `/auth/login?next=${encodeURIComponent(`/checkout?plan=${planSlug}`)}`

  return (
    <div
      className={[
        'relative flex flex-col rounded-2xl border bg-ikz-surface p-6 transition-all hover:-translate-y-1',
        tier.style.border,
        tier.style.featured ? 'ring-1 ring-ikz-lime/40 shadow-glow-lime' : '',
      ].join(' ')}
    >
      {tier.style.featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-ikz-lime px-4 py-1 text-xs font-black text-ikz-bg">
          {mostPopular}
        </div>
      )}

      <div className={`mb-3 inline-block self-start rounded-full px-3 py-0.5 text-xs font-black tracking-widest ${tier.style.badge}`}>
        {tier.label}
      </div>

      <div className="mb-1 text-4xl font-black text-white">{tier.price}</div>
      <div className="mb-0.5 text-xs text-zinc-300">{priceNote}</div>
      <div className="mb-1 text-sm font-semibold text-gray-400">{tier.builds}</div>
      <div className="mb-5 text-xs italic text-zinc-300">{tier.audience}</div>

      <ul className="mb-8 flex-1 space-y-2.5">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <Check size={14} className="mt-0.5 shrink-0 text-ikz-cyan" />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={[
          'block rounded-xl py-3 text-center text-sm font-bold transition-opacity hover:opacity-90',
          isCurrentPlan
            ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 cursor-default'
            : tier.style.cta === 'primary'
              ? 'bg-ikz-lime text-ikz-bg shadow-glow-lime hover:shadow-glow-lime-lg'
              : 'border border-ikz-border text-gray-300 hover:border-gray-600',
        ].join(' ')}
      >
        {isCurrentPlan ? 'Seu plano' : ctaPrefix} {tier.label}
      </Link>
    </div>
  )
}
