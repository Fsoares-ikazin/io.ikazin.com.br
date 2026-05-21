'use client'

export type IkazinTier = 'basic' | 'essentials' | 'advanced' | 'premium'

type DashboardBuild = {
  title?: string | null
  buildNumber?: number | null
  progress?: {
    percent?: number | null
    completed?: boolean | null
  } | null
}

type DashboardResponse = {
  last_accessed?: DashboardBuild | null
  in_progress?: DashboardBuild[]
  plan_builds?: DashboardBuild[]
  suggested_next?: DashboardBuild | null
  plan_tier?: string | null
}

type DownloadsResponse = {
  downloads?: Array<{
    title?: string | null
    build_number?: number | null
    file_type?: string | null
    downloaded_at?: string | null
  }>
}

export type IkazinAccountSummary = {
  currentPlan: IkazinTier | null
  maxTierEver: IkazinTier | null
  assignedAt: string | null
  planSource: string | null
  buildsUnlocked: number | null
  inProgressCount: number | null
  completedCount: number | null
  completionPct: number | null
  downloadsCount: number | null
  lastAccessedTitle: string | null
  nextSuggestedTitle: string | null
  recentDownloadLabel: string | null
}

const TIER_ORDER: IkazinTier[] = ['basic', 'essentials', 'advanced', 'premium']

export const IKAZIN_TIER_LABELS: Record<IkazinTier, string> = {
  basic: 'Basic',
  essentials: 'Essentials',
  advanced: 'Advanced',
  premium: 'Premium',
}

function normalizeTier(value: unknown): IkazinTier | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return TIER_ORDER.includes(normalized as IkazinTier) ? (normalized as IkazinTier) : null
}

function coerceDate(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  return value
}

export function getTierLabel(value: IkazinTier | null): string {
  return value ? IKAZIN_TIER_LABELS[value] : 'Sem plano'
}

export function getTierTone(value: IkazinTier | null): string {
  switch (value) {
    case 'premium':
      return 'border-amber-400/30 bg-amber-500/10 text-amber-200'
    case 'advanced':
      return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
    case 'essentials':
      return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
    case 'basic':
      return 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200'
    default:
      return 'border-zinc-700 bg-zinc-900/70 text-zinc-300'
  }
}

export function extractIkazinAccountSummary(
  user: any,
  dashboard?: DashboardResponse | null,
  downloads?: DownloadsResponse | null,
): IkazinAccountSummary {
  const details = user?.details ?? {}
  const currentPlan = normalizeTier(dashboard?.plan_tier ?? details?.ikazin_plan)
  const maxTierEver = normalizeTier(details?.ikazin_max_tier_ever ?? currentPlan)
  const planBuilds = Array.isArray(dashboard?.plan_builds) ? dashboard?.plan_builds : []
  const inProgress = Array.isArray(dashboard?.in_progress) ? dashboard?.in_progress : []
  const downloadsList = Array.isArray(downloads?.downloads) ? downloads?.downloads : []
  const completedCount = planBuilds.filter((build) => build?.progress?.completed).length
  const buildsUnlocked = planBuilds.length || null
  const completionPct =
    buildsUnlocked && buildsUnlocked > 0
      ? Math.round((completedCount / buildsUnlocked) * 100)
      : null
  const recentDownload = downloadsList[0]
  const recentDownloadLabel = recentDownload
    ? `Build ${recentDownload.build_number ?? '?'} · ${formatFileType(recentDownload.file_type)}`
    : null

  return {
    currentPlan,
    maxTierEver,
    assignedAt: coerceDate(details?.ikazin_plan_assigned_at),
    planSource: typeof details?.ikazin_plan_source === 'string' ? details.ikazin_plan_source : null,
    buildsUnlocked,
    inProgressCount: inProgress.length || null,
    completedCount: completedCount || null,
    completionPct,
    downloadsCount: downloadsList.length || null,
    lastAccessedTitle: dashboard?.last_accessed?.title ?? null,
    nextSuggestedTitle: dashboard?.suggested_next?.title ?? null,
    recentDownloadLabel,
  }
}

function formatFileType(value: string | null | undefined): string {
  switch (value) {
    case 'pdf_guide':
      return 'PDF'
    case 'tia_portal':
      return 'Projeto'
    case 'exe':
      return 'Executável'
    default:
      return 'Arquivo'
  }
}

export async function fetchIkazinAccountRemoteData(accessToken?: string | null) {
  if (!accessToken) {
    return { dashboard: null, downloads: null }
  }

  const headers = { Authorization: `Bearer ${accessToken}` }
  const [dashboardResponse, downloadsResponse] = await Promise.allSettled([
    fetch('/api/v1/ikazin/dashboard', {
      credentials: 'include',
      headers,
    }),
    fetch('/api/v1/ikazin/downloads', {
      credentials: 'include',
      headers,
    }),
  ])

  const dashboard = await readJsonIfOk<DashboardResponse>(dashboardResponse)
  const downloads = await readJsonIfOk<DownloadsResponse>(downloadsResponse)
  return { dashboard, downloads }
}

async function readJsonIfOk<T>(result: PromiseSettledResult<Response>): Promise<T | null> {
  if (result.status !== 'fulfilled' || !result.value.ok) {
    return null
  }

  try {
    return (await result.value.json()) as T
  } catch {
    return null
  }
}
