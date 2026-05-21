'use client'

import Link from 'next/link'

import { Button } from '@components/ui/button'
import IkazinBadge from '@components/ikazin/ui/IkazinBadge'
import { color, type BuildTier } from '@/lib/ikazin/tokens'
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

  return (
    <section
      className="rounded-[20px] border p-5 transition-colors"
      style={
        emphasized
          ? { borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)' }
          : { borderColor: color.border.DEFAULT, background: color.surface }
      }
    >
      <p className="mb-3 text-sm font-medium text-zinc-300">A seguir:</p>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <IkazinBadge variant="tier" tier={nextBuild.tier} size="md" />
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
