export const IKAZIN_DESIGN = {
  colors: {
    bg: '#0a0e0d',
    surface: '#141a18',
    primary: '#10b981',
    primaryHover: '#059669',
    textPrimary: '#f4f4f5',
    textMuted: '#71717a',
  },
  radius: '12px',
  font: 'Plus Jakarta Sans',
} as const

export type BuildTier = 'basic' | 'essentials' | 'advanced' | 'premium'

export const TIER_CONFIG: Record<
  BuildTier,
  { label: string; color: string; buildRange: [number, number] }
> = {
  basic:      { label: 'Basic',      color: '#6366f1', buildRange: [1,  8]  },
  essentials: { label: 'Essentials', color: '#f59e0b', buildRange: [9,  13] },
  advanced:   { label: 'Advanced',   color: '#f97316', buildRange: [14, 18] },
  premium:    { label: 'Premium',    color: '#10b981', buildRange: [19, 25] },
}

export const TOTAL_BUILDS = 25

export function getTierForBuild(buildNumber: number): BuildTier {
  if (buildNumber <= 8)  return 'basic'
  if (buildNumber <= 13) return 'essentials'
  if (buildNumber <= 18) return 'advanced'
  return 'premium'
}
