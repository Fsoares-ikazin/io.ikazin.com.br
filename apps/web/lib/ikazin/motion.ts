/**
 * IKAZIN.IO Motion Vocabulary — variantes Framer Motion reutilizáveis.
 *
 * Lib em uso: `motion` 12.34.3 (npm) — API compatível com `framer-motion`.
 *
 * Princípios:
 *  - 150-300ms para microinterações (hover, focus)
 *  - 250-400ms para entradas de elemento
 *  - 400-600ms para transições de página
 *  - Ease padrão: easeOut para entrada, easeIn para saída
 *  - Respeitar `prefers-reduced-motion` (já tratado no LazyMotion wrapper)
 *
 * USO:
 *   import { motion } from 'motion/react'
 *   import { fadeUp, staggerChildren, cardHover } from '@/lib/ikazin/motion'
 *
 *   <motion.div variants={fadeUp} initial="hidden" animate="visible">
 *     ...
 *   </motion.div>
 *
 *   <motion.div variants={staggerChildren} initial="hidden" animate="visible">
 *     {builds.map(b => <motion.div key={b.id} variants={fadeUp}>...</motion.div>)}
 *   </motion.div>
 */

import type { Variants, Transition } from 'motion/react'

// ─────────────────────────────────────────────────────────────────────────────
// EASINGS
// ─────────────────────────────────────────────────────────────────────────────

export const ease = {
  /** Entrada padrão — cresce desacelerando */
  out: [0.22, 1, 0.36, 1] as const,
  /** Saída padrão — sai acelerando */
  in:  [0.55, 0, 1, 0.45] as const,
  /** Bounce sutil — usar com moderação em milestones */
  spring: [0.34, 1.56, 0.64, 1] as const,
  /** Linear — barras de progresso */
  linear: [0, 0, 1, 1] as const,
}

// ─────────────────────────────────────────────────────────────────────────────
// DURATIONS (segundos — Framer usa segundos)
// ─────────────────────────────────────────────────────────────────────────────

export const duration = {
  instant: 0.1,
  fast:    0.15, // hover, focus
  base:    0.2,  // toggles, dropdowns
  slow:    0.3,  // entrada de elemento
  slower:  0.4,  // entrada de página, modal
  pause:   0.6,  // milestones, animações grandes
} as const

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES — ENTRADAS DE ELEMENTO
// ─────────────────────────────────────────────────────────────────────────────

/** Fade simples — usar em containers que não devem se mover */
export const fade: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.out } },
}

/** Sobe + aparece — padrão para cards entrando na viewport */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slower, ease: ease.out } },
}

/** Desce — usar em dropdowns, menus que abrem para cima */
export const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
}

/** Vem da esquerda — sidebars, slide-in lateral */
export const slideRight: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
}

/** Toast — vem da direita e sai pra direita */
export const toast: Variants = {
  hidden:  { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
  exit:    { opacity: 0, x: 100, transition: { duration: duration.base, ease: ease.in } },
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES — STAGGER (lista de items entrando em sequência)
// ─────────────────────────────────────────────────────────────────────────────

/** Container que orquestra entrada de filhos */
export const staggerChildren = (delayBetween = 0.05): Variants => ({
  hidden:  { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delayBetween,
      delayChildren: 0.1,
    },
  },
})

/** Default stagger — 50ms entre cards */
export const staggerDefault: Variants = staggerChildren(0.05)

/** Stagger lento — 100ms entre seções */
export const staggerSections: Variants = staggerChildren(0.1)

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES — INTERAÇÃO (hover, tap, focus)
// ─────────────────────────────────────────────────────────────────────────────

/** Card hover — leve elevação + scale */
export const cardHover = {
  rest:  { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2, transition: { duration: duration.fast, ease: ease.out } },
  tap:   { scale: 0.98, transition: { duration: duration.instant } },
} satisfies Variants

/** Botão — leve scale no hover */
export const button = {
  rest:  { scale: 1 },
  hover: { scale: 1.03, transition: { duration: duration.fast, ease: ease.out } },
  tap:   { scale: 0.97, transition: { duration: duration.instant } },
} satisfies Variants

/** Play button do hero — scale maior */
export const playButton = {
  rest:  { scale: 1 },
  hover: { scale: 1.08, transition: { duration: duration.fast, ease: ease.spring } },
  tap:   { scale: 0.95 },
} satisfies Variants

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES — MODAL / BACKDROP
// ─────────────────────────────────────────────────────────────────────────────

export const backdrop: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  exit:    { opacity: 0, transition: { duration: duration.fast, ease: ease.in } },
}

export const modalContent: Variants = {
  hidden:  { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
  exit:    { opacity: 0, scale: 0.95, y: 10, transition: { duration: duration.base, ease: ease.in } },
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES — PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

/** Preenche de 0 a N% — usar em <motion.div animate={{ width: pct }} /> */
export const progressBar = (pct: number): Transition & { width: string } => ({
  width: `${pct}%`,
  duration: duration.pause,
  ease: ease.out,
  delay: 0.2,
})

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES — SKELETON / SHIMMER
// ─────────────────────────────────────────────────────────────────────────────

/** Cross-fade entre skeleton e conteúdo */
export const skeletonToContent: Variants = {
  loading:  { opacity: 1 },
  loaded:   { opacity: 0, transition: { duration: duration.slow, ease: ease.in } },
}

export const contentFromSkeleton: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.out } },
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES — PÁGINA (entrada do route container)
// ─────────────────────────────────────────────────────────────────────────────

export const pageTransition: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slower, ease: ease.out } },
  exit:    { opacity: 0, y: -4, transition: { duration: duration.base, ease: ease.in } },
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES — MILESTONE (build completo, level up, etc)
// ─────────────────────────────────────────────────────────────────────────────

/** Pop celebratório — usar com moderação (1x por ação significativa) */
export const milestone: Variants = {
  hidden:  { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.pause, ease: ease.spring },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLOS DE USO (referência rápida)
// ─────────────────────────────────────────────────────────────────────────────

/*
// 1. Card simples entrando ao montar
<motion.div variants={fadeUp} initial="hidden" animate="visible">
  ...
</motion.div>

// 2. Grid de cards com stagger
<motion.div variants={staggerDefault} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={fadeUp}>
      <BuildCard {...item} />
    </motion.div>
  ))}
</motion.div>

// 3. Card com hover state
<motion.div variants={cardHover} initial="rest" whileHover="hover" whileTap="tap">
  ...
</motion.div>

// 4. Modal
<AnimatePresence>
  {open && (
    <>
      <motion.div variants={backdrop} initial="hidden" animate="visible" exit="exit" />
      <motion.div variants={modalContent} initial="hidden" animate="visible" exit="exit">
        ...
      </motion.div>
    </>
  )}
</AnimatePresence>

// 5. Toast
<AnimatePresence>
  {notification && (
    <motion.div variants={toast} initial="hidden" animate="visible" exit="exit">
      ...
    </motion.div>
  )}
</AnimatePresence>

// 6. Progress bar
<motion.div
  className="h-1 bg-emerald-500"
  initial={{ width: 0 }}
  animate={progressBar(progressPct)}
/>

// 7. Página inteira
<motion.main variants={pageTransition} initial="hidden" animate="visible" exit="exit">
  ...
</motion.main>
*/
