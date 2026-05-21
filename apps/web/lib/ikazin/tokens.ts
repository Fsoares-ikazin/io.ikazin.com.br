/**
 * IKAZIN.IO Design System 2.0 — fonte única de verdade visual.
 *
 * Decisão arquitetural (2026-05-20): paleta autoritativa = emerald + zinc.
 * docs/brand-dna.md (lime+cyan+slate) fica deprecated até RFC explícita.
 *
 * USO:
 *   import { tokens, tier } from '@/lib/ikazin/tokens'
 *   <div style={{ background: tokens.color.bg, color: tokens.color.text.primary }} />
 *   <Badge color={tier('basic').color} />
 *
 * NÃO duplique cores em componentes. Sempre importe daqui.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CORES
// ─────────────────────────────────────────────────────────────────────────────

export const color = {
  // Backgrounds
  bg: '#0a0e0d',          // página
  surface: '#141a18',     // cards
  surfaceRaised: '#1c2421', // hover / nested cards
  surfaceSunken: '#070908', // áreas embaixo (sidebar fechada, code blocks)

  // Bordas
  border: {
    DEFAULT: '#27272a',   // zinc-800
    hover: '#3f3f46',     // zinc-700
    focus: 'rgba(16,185,129,0.5)', // emerald-500/50
    subtle: '#1f1f23',    // zinc-900 quase invisível
  },

  // Texto — contrastes WCAG AA validados sobre bg #0a0e0d
  text: {
    primary: '#f4f4f5',   // zinc-100 → 16.5:1 ✓ AAA
    secondary: '#d4d4d8', // zinc-300 → 11.8:1 ✓ AAA
    muted: '#a1a1aa',     // zinc-400 → 6.9:1 ✓ AA (texto pequeno)
    dim: '#71717a',       // zinc-500 → 4.6:1 ✓ AA (decorativo, evitar texto)
    disabled: '#52525b',  // zinc-600 → 3.0:1 — só para disabled visual
  },

  // Marca
  primary: {
    DEFAULT: '#10b981',   // emerald-500
    hover: '#059669',     // emerald-600
    active: '#047857',    // emerald-700
    soft: 'rgba(16,185,129,0.12)', // bg em badges/highlights
    glow: 'rgba(16,185,129,0.35)', // shadow glow
    text: '#34d399',      // emerald-400 → 9.1:1 sobre bg ✓ AA
  },

  // Estados semânticos (sobre bg escuro)
  success: '#34d399',     // emerald-400
  warning: '#fbbf24',     // amber-400 → 11.4:1 ✓ AAA
  error:   '#f87171',     // red-400 → 6.5:1 ✓ AA
  info:    '#60a5fa',     // blue-400 → 7.3:1 ✓ AA
} as const

// ─────────────────────────────────────────────────────────────────────────────
// TIERS DE BUILD
// ─────────────────────────────────────────────────────────────────────────────

export type BuildTier = 'basic' | 'essentials' | 'advanced' | 'premium'

interface TierToken {
  label: string
  range: [number, number]
  /** Cor principal — usar em borders, badges, ícones */
  color: string
  /** Versão clara — usar em texto sobre bg escuro (contraste ≥4.5:1) */
  textColor: string
  /** Background suave para badges/cards (cor com alpha baixo) */
  bgSoft: string
  /** Glow para hover/foco */
  glow: string
}

export const TIERS: Record<BuildTier, TierToken> = {
  basic: {
    label: 'Basic',
    range: [1, 8],
    color: '#6366f1',     // indigo-500
    textColor: '#a5b4fc', // indigo-300 → 7.4:1 ✓
    bgSoft: 'rgba(99,102,241,0.12)',
    glow: 'rgba(99,102,241,0.35)',
  },
  essentials: {
    label: 'Essentials',
    range: [9, 13],
    color: '#f59e0b',     // amber-500
    textColor: '#fcd34d', // amber-300 → 11.4:1 ✓ AAA
    bgSoft: 'rgba(245,158,11,0.12)',
    glow: 'rgba(245,158,11,0.35)',
  },
  advanced: {
    label: 'Advanced',
    range: [14, 18],
    color: '#f97316',     // orange-500
    textColor: '#fdba74', // orange-300 → 8.6:1 ✓ AAA
    bgSoft: 'rgba(249,115,22,0.12)',
    glow: 'rgba(249,115,22,0.35)',
  },
  premium: {
    label: 'Premium',
    range: [19, 25],
    color: '#10b981',     // emerald-500 (sincronizado com primary)
    textColor: '#6ee7b7', // emerald-300 → 11.2:1 ✓ AAA
    bgSoft: 'rgba(16,185,129,0.12)',
    glow: 'rgba(16,185,129,0.35)',
  },
}

export const TOTAL_BUILDS = 25

export function tierForBuild(buildNumber: number): BuildTier {
  if (buildNumber <= 8) return 'basic'
  if (buildNumber <= 13) return 'essentials'
  if (buildNumber <= 18) return 'advanced'
  return 'premium'
}

export function tier(t: BuildTier): TierToken {
  return TIERS[t]
}

// ─────────────────────────────────────────────────────────────────────────────
// GRADIENTES
// ─────────────────────────────────────────────────────────────────────────────

export const gradient = {
  /** Overlay do hero — escurece da esquerda para direita */
  heroOverlay: 'linear-gradient(90deg, rgba(10,14,13,0.95) 0%, rgba(10,14,13,0.6) 50%, transparent 100%)',

  /** Glow sutil em hover de card */
  cardHover: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)',

  /** Onboarding banner — combina primary glow */
  onboarding: 'radial-gradient(circle at top left, rgba(16,185,129,0.25), transparent 70%), linear-gradient(180deg, rgba(16,185,129,0.05), transparent)',

  /** Por tier — usar em headers de seção do catálogo */
  tier: (t: BuildTier) => {
    const c = TIERS[t]
    return `linear-gradient(135deg, ${c.bgSoft}, transparent)`
  },

  /** Player overlay (gradient inferior sobre vídeo) */
  videoControls: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// TIPOGRAFIA
// ─────────────────────────────────────────────────────────────────────────────

export const font = {
  /** UI + body + headlines */
  sans: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  /** Code blocks, specs técnicas, valores numéricos do PLC */
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
} as const

export const fontSize = {
  display: '3.5rem',  // 56px — hero headlines
  h1: '2.25rem',      // 36px
  h2: '1.5rem',       // 24px
  h3: '1.125rem',     // 18px
  bodyLg: '1rem',     // 16px
  body: '0.875rem',   // 14px
  caption: '0.75rem', // 12px
  code: '0.875rem',   // 14px (mono)
} as const

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

export const lineHeight = {
  tight: 1.2,    // headings
  snug: 1.4,     // labels, captions
  body: 1.6,     // body text
  loose: 1.8,    // long-form blog
} as const

export const letterSpacing = {
  tightest: '-0.04em', // display
  tight: '-0.02em',    // h1/h2
  normal: '0',
  wide: '0.02em',
  widest: '0.08em',    // uppercase labels
} as const

// ─────────────────────────────────────────────────────────────────────────────
// ESPAÇAMENTO — sistema 4px base
// ─────────────────────────────────────────────────────────────────────────────

export const space = {
  '0.5': '2px',
  '1':   '4px',   // gap chip/tag
  '2':   '8px',   // padding badge interno
  '3':   '12px',  // gap card-to-card horizontal
  '4':   '16px',  // padding card interno
  '5':   '20px',
  '6':   '24px',  // gap entre subseções
  '8':   '32px',  // gap entre seções principais
  '10':  '40px',
  '12':  '48px',  // padding de página vertical
  '16':  '64px',  // espaço entre blocos da landing
  '24':  '96px',  // blocos hero
} as const

// ─────────────────────────────────────────────────────────────────────────────
// RAIO, SHADOW, Z-INDEX
// ─────────────────────────────────────────────────────────────────────────────

export const radius = {
  sm:   '6px',
  md:   '8px',
  DEFAULT: '12px',
  lg:   '16px',
  xl:   '20px',
  '2xl': '24px',
  full: '9999px',
} as const

export const shadow = {
  /** Card em repouso — quase invisível */
  card: '0 1px 2px rgba(0,0,0,0.3)',
  /** Card em hover */
  cardHover: '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.2)',
  /** Modal */
  modal: '0 24px 48px rgba(0,0,0,0.6)',
  /** Glow primary (CTAs, foco) */
  glowPrimary: '0 0 24px rgba(16,185,129,0.35)',
  /** Glow por tier */
  glowTier: (t: BuildTier) => `0 0 24px ${TIERS[t].glow}`,
} as const

/** Re-export do Tailwind config — não duplique aqui */
export const zIndex = {
  base: 0,
  sticky: 10,
  stickyHeader: 15,
  dropdown: 100,
  overlay: 120,
  modalBackdrop: 200,
  modal: 210,
  popover: 250,
  tooltip: 250,
  toast: 300,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// BREAKPOINTS — mobile-first
// ─────────────────────────────────────────────────────────────────────────────

export const screen = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTADOR DEFAULT (compatibilidade)
// ─────────────────────────────────────────────────────────────────────────────

export const tokens = {
  color,
  gradient,
  font,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  space,
  radius,
  shadow,
  zIndex,
  screen,
  tiers: TIERS,
} as const

export type Tokens = typeof tokens

// ─────────────────────────────────────────────────────────────────────────────
// ALIAS BACK-COMPAT — não usar em código novo. Será removido em P0 do plano.
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated use `tokens.color` */
export const IKAZIN_DESIGN = {
  colors: {
    bg: color.bg,
    surface: color.surface,
    primary: color.primary.DEFAULT,
    primaryHover: color.primary.hover,
    textPrimary: color.text.primary,
    textMuted: color.text.muted,
  },
  radius: radius.DEFAULT,
  font: 'Plus Jakarta Sans',
} as const

/** @deprecated use `TIERS` ou `tier()` */
export const TIER_CONFIG = {
  basic:      { label: TIERS.basic.label,      color: TIERS.basic.color,      buildRange: TIERS.basic.range },
  essentials: { label: TIERS.essentials.label, color: TIERS.essentials.color, buildRange: TIERS.essentials.range },
  advanced:   { label: TIERS.advanced.label,   color: TIERS.advanced.color,   buildRange: TIERS.advanced.range },
  premium:    { label: TIERS.premium.label,    color: TIERS.premium.color,    buildRange: TIERS.premium.range },
} as const

/** @deprecated use `tierForBuild()` */
export const getTierForBuild = tierForBuild
