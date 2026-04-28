'use client'

import { Lock, Unlock } from 'lucide-react'

export type BuildTier = 'basic' | 'essentials' | 'advanced' | 'premium'

export interface BuildCatalogItem {
  id: number
  build_uuid: string
  number: number
  tier: BuildTier
  title: string
  description?: string | null
  youtube_url?: string | null
  tutorial_md?: string | null
  thumbnail_key?: string | null
  published: boolean
  has_access: boolean
  creation_date: string
  update_date: string
}

const tierStyles: Record<BuildTier, string> = {
  basic: 'border-gray-700 bg-gray-800/70 text-gray-300',
  essentials: 'border-emerald-700/70 bg-emerald-950/50 text-emerald-300',
  advanced: 'border-blue-700/70 bg-blue-950/50 text-blue-300',
  premium: 'border-purple-700/70 bg-purple-950/50 text-purple-300',
}

interface BuildCardProps {
  build: BuildCatalogItem
  onSelect: (build: BuildCatalogItem) => void
}

export function BuildCard({ build, onSelect }: BuildCardProps) {
  const accessLabel = build.has_access ? 'Unlocked build' : 'Locked build'

  return (
    <button
      type="button"
      onClick={() => onSelect(build)}
      className="group flex min-h-[150px] w-full flex-col rounded-lg border border-ikz-border bg-ikz-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:border-ikz-cyan/60 hover:shadow-glow"
      aria-label={`${build.has_access ? 'Open' : 'View plans for'} build B${build.number}: ${build.title}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-ikz-cyan/40 bg-ikz-cyan/10 px-2.5 py-1 text-xs font-black text-ikz-cyan">
            B{build.number}
          </span>
          <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${tierStyles[build.tier]}`}>
            {build.tier}
          </span>
        </div>
        <span
          className={`rounded-md border p-2 ${
            build.has_access
              ? 'border-ikz-lime/40 bg-ikz-lime/10 text-ikz-lime'
              : 'border-gray-700 bg-gray-900/70 text-gray-400'
          }`}
          title={accessLabel}
          aria-label={accessLabel}
        >
          {build.has_access ? <Unlock size={16} /> : <Lock size={16} />}
        </span>
      </div>

      <h3 className="text-base font-bold leading-snug text-white transition-colors group-hover:text-ikz-cyan">
        {build.title}
      </h3>
    </button>
  )
}
