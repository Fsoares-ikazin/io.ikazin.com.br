import { getAPIUrl } from '@services/config/config'

export type TierSlug = 'basic' | 'essentials' | 'advanced' | 'premium'

export interface Build {
  id: number
  build_uuid: string
  number: number
  tier: TierSlug
  title: string
  description: string | null
  exe_key: string | null
  tia_key: string | null
  youtube_url: string | null
  tutorial_md: string | null
  thumbnail_key: string | null
  published: boolean
  has_access: boolean
  creation_date: string
  update_date: string
}

export interface DownloadUrlResponse {
  url: string
  expires_in: number
}

export async function getBuilds(): Promise<Build[]> {
  const res = await fetch(`${getAPIUrl()}builds`, { credentials: 'include' })
  if (!res.ok) return []
  return res.json()
}

export async function getBuild(buildUuid: string): Promise<Build | null> {
  const res = await fetch(`${getAPIUrl()}builds/${buildUuid}`, { credentials: 'include' })
  if (!res.ok) return null
  return res.json()
}

export async function getDownloadUrl(
  buildUuid: string,
  type: 'unity' | 'tia'
): Promise<DownloadUrlResponse | null> {
  const res = await fetch(
    `${getAPIUrl()}builds/${buildUuid}/download?type=${type}`,
    { credentials: 'include' }
  )
  if (!res.ok) return null
  return res.json()
}

export const TIER_ORDER: TierSlug[] = ['basic', 'essentials', 'advanced', 'premium']

export const TIER_LABELS: Record<TierSlug, string> = {
  basic: 'BASIC',
  essentials: 'ESSENTIALS',
  advanced: 'ADVANCED',
  premium: 'PREMIUM',
}

export const TIER_COLORS: Record<TierSlug, { bg: string; text: string; border: string }> = {
  basic:      { bg: 'bg-zinc-800',    text: 'text-zinc-300',   border: 'border-zinc-600' },
  essentials: { bg: 'bg-emerald-950', text: 'text-emerald-400', border: 'border-emerald-700' },
  advanced:   { bg: 'bg-blue-950',    text: 'text-blue-400',   border: 'border-blue-700' },
  premium:    { bg: 'bg-purple-950',  text: 'text-purple-400', border: 'border-purple-700' },
}
