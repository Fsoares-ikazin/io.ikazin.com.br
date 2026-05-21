'use client'

import Link from 'next/link'

import { Button } from '@components/ui/button'
import { TIER_CONFIG, type BuildTier } from '@/lib/ikazin/constants'
import { getUriWithOrg } from '@services/config/config'

type NextBuildCompactCardProps = {
  orgslug: string
  nextBuild: {
    id: string
    build_number: number
    title: string
    tier: BuildTier
  } | null
  emphasized?: boolean
}

export default function NextBuildCompactCard({
  orgslug,
  nextBuild,
  emphasized = false,
}: NextBuildCompactCardProps) {
  if (!nextBuild) return null

  const tier = TIER_CONFIG[nextBuild.tier]

  return (
    <section
      className={[
        'rounded-[20px] border p-5 transition-colors',
        emphasized
          ? 'border-emerald-500/30 bg-emerald-500/10'
          : 'border-zinc-800 bg-[#141a18]',
      ].join(' ')}
    >
      <p className="mb-3 text-sm font-medium text-zinc-400">A seguir:</p>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <span
            className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{
              borderColor: `${tier.color}55`,
              backgroundColor: `${tier.color}12`,
              color: tier.color,
            }}
          >
            {tier.label}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-zinc-100">
            Build {nextBuild.build_number} — {nextBuild.title}
          </h3>
        </div>

        <Button
          asChild
          className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
        >
          <Link href={getUriWithOrg(orgslug, `/build/${nextBuild.build_number}`)}>Comecar →</Link>
        </Button>
      </div>
    </section>
  )
}
