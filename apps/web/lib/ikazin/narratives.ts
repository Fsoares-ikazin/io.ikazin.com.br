/**
 * IKAZIN.IO — geração de texto contextual (saudação, narrativa de progresso).
 *
 * Funções puras. Sem side-effects, sem fetch. Recebem state, devolvem string.
 */

import { copy } from './copy'
import { TIERS, tierForBuild, type BuildTier } from './tokens'

/** Retorna saudação baseada na hora local. */
export function greetingNow(name: string): string {
  const h = new Date().getHours()
  if (h < 12) return copy.greetings.morning(name)
  if (h < 18) return copy.greetings.afternoon(name)
  return copy.greetings.evening(name)
}

export interface ProgressState {
  tier: BuildTier | null
  completedInTier: number
  totalInTier: number
  nextTier?: BuildTier | null
}

/** Narrativa contextual sobre o progresso do user no tier atual. */
export function progressNarrative(state: ProgressState): string {
  if (!state.tier) {
    return 'Comece pela trilha Basic para destravar a base.'
  }

  const t = TIERS[state.tier]
  const remaining = state.totalInTier - state.completedInTier

  if (remaining <= 0) {
    if (state.nextTier) {
      const next = TIERS[state.nextTier]
      return `Você concluiu o tier ${t.label}. Próximo: ${next.label}.`
    }
    return `Você concluiu o tier ${t.label}. Trilha completa.`
  }

  if (remaining === 1) {
    return `Falta 1 build para fechar o tier ${t.label}.`
  }

  return `Você está no build ${state.completedInTier + 1} de ${state.totalInTier} do ${t.label}.`
}

/** Próximo tier na sequência (basic → essentials → advanced → premium). */
export function nextTierOf(t: BuildTier): BuildTier | null {
  const order: BuildTier[] = ['basic', 'essentials', 'advanced', 'premium']
  const idx = order.indexOf(t)
  if (idx < 0 || idx >= order.length - 1) return null
  return order[idx + 1]
}

/** Deriva ProgressState a partir de uma lista de builds com flag `completed`. */
export function deriveProgressState(
  completedBuildNumbers: number[],
  currentTier: BuildTier | null,
): ProgressState {
  if (!currentTier) {
    return { tier: null, completedInTier: 0, totalInTier: 0 }
  }

  const range = TIERS[currentTier].range
  const [from, to] = range
  const total = to - from + 1
  const completed = completedBuildNumbers.filter(
    (n) => n >= from && n <= to,
  ).length

  return {
    tier: currentTier,
    completedInTier: completed,
    totalInTier: total,
    nextTier: nextTierOf(currentTier),
  }
}

/** Helper alternativo: derive direto do build em uso. */
export function tierFromBuildNumber(n: number): BuildTier {
  return tierForBuild(n)
}
