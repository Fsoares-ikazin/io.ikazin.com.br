'use client'

import Link from 'next/link'
import { ArrowRight, BookOpenCheck, Download, Gauge, Sparkles, Trophy } from 'lucide-react'
import { getUriWithOrg } from '@services/config/config'
import {
  type IkazinAccountSummary,
  getTierLabel,
  getTierTone,
} from '@components/Objects/Account/accountIkazin'

function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string | null
}) {
  return (
    <div className="rounded-2xl border border-ikz-border bg-black/20 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-gray-100">{value}</p>
      {hint ? <p className="mt-1 text-sm text-gray-400">{hint}</p> : null}
    </div>
  )
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function AccountIkazinStats({
  orgslug,
  summary,
  loading,
}: {
  orgslug: string
  summary: IkazinAccountSummary
  loading: boolean
}) {
  const assignedAtLabel = formatDate(summary.assignedAt)

  return (
    <section className="mx-5 mt-5 overflow-hidden rounded-[28px] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_42%),linear-gradient(135deg,rgba(13,18,28,0.98),rgba(20,26,38,0.92))] shadow-lg shadow-black/30">
      <div className="flex flex-col gap-6 p-5 lg:flex-row lg:items-start lg:justify-between lg:p-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles size={14} />
            Ikazin
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-white">Seu resumo de acesso e avanço</h2>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTierTone(summary.currentPlan)}`}>
              Plano atual: {getTierLabel(summary.currentPlan)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Visão rápida do seu momento na trilha Ikazin, sem depender de configuração extra.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Builds liberados"
              value={summary.buildsUnlocked != null ? String(summary.buildsUnlocked) : '—'}
              hint={summary.nextSuggestedTitle ? `Próximo sugerido: ${summary.nextSuggestedTitle}` : 'Seu plano define quantos builds ficam disponíveis.'}
            />
            <StatTile
              label="Em progresso"
              value={summary.inProgressCount != null ? String(summary.inProgressCount) : '—'}
              hint={summary.lastAccessedTitle ? `Último acesso: ${summary.lastAccessedTitle}` : 'Nenhum build retomado ainda.'}
            />
            <StatTile
              label="Concluídos"
              value={summary.completedCount != null ? String(summary.completedCount) : '—'}
              hint={summary.completionPct != null ? `${summary.completionPct}% dos builds liberados` : 'O percentual aparece quando há trilha liberada.'}
            />
            <StatTile
              label="Downloads"
              value={summary.downloadsCount != null ? String(summary.downloadsCount) : '—'}
              hint={summary.recentDownloadLabel ?? 'O histórico aparece quando houver materiais baixados.'}
            />
          </div>
        </div>

        <div className="grid min-w-[280px] gap-3 lg:max-w-sm lg:flex-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-100">
              <Trophy size={16} className="text-amber-300" />
              Maior tier já alcançado
            </div>
            <p className="mt-2 text-xl font-black text-white">{getTierLabel(summary.maxTierEver)}</p>
            <p className="mt-1 text-sm text-gray-400">
              {assignedAtLabel
                ? `Ativado em ${assignedAtLabel}${summary.planSource ? ` via ${summary.planSource}` : ''}.`
                : 'Ativação será refletida aqui assim que o perfil carregar os dados completos.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Link
              href={getUriWithOrg(orgslug, '/dashboard')}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-gray-100 transition-colors hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <Gauge size={16} className="text-cyan-300" />
                Abrir dashboard
              </span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href={getUriWithOrg(orgslug, '/catalogo')}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-gray-100 transition-colors hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <BookOpenCheck size={16} className="text-emerald-300" />
                Ver catálogo
              </span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href={getUriWithOrg(orgslug, '/welcome')}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-gray-100 transition-colors hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <Download size={16} className="text-fuchsia-300" />
                Materiais e guia
              </span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
              Atualizando métricas do dashboard e histórico de downloads...
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default AccountIkazinStats
