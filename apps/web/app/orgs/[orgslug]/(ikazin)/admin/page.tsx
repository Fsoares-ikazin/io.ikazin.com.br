'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import IkazinModal from '@components/ikazin/ui/IkazinModal'
import { Button } from '@components/ui/button'

const PLAN_TIERS = ['basic', 'essentials', 'advanced', 'premium', 'none'] as const
type PlanTier = (typeof PLAN_TIERS)[number]

type PlanEntry = { id: number; email: string; plan_tier: string }

const PLAN_RANK: Record<PlanTier, number> = {
  none: 0,
  basic: 1,
  essentials: 2,
  advanced: 3,
  premium: 4,
}

export default function IkazinAdminPage({
  params,
}: {
  params: Promise<{ orgslug: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const session = useLHSession() as any
  const status = session?.status ?? 'loading'
  const accessToken = session?.data?.tokens?.access_token
  const isSuperadmin = session?.data?.user?.is_superadmin ?? false

  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState<PlanTier>('basic')
  const [orgSlug, setOrgSlug] = useState(resolvedParams.orgslug)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [planList, setPlanList] = useState<PlanEntry[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [confirmDowngradeOpen, setConfirmDowngradeOpen] = useState(false)
  const [pendingAssignment, setPendingAssignment] = useState<{
    email: string
    currentPlan: PlanTier
    nextPlan: PlanTier
  } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
    if (status === 'authenticated' && !isSuperadmin) router.replace('/')
  }, [status, isSuperadmin, router])

  useEffect(() => {
    if (status !== 'authenticated' || !isSuperadmin) return
    loadPlanList()
  }, [status, isSuperadmin, accessToken])

  async function loadPlanList() {
    setListLoading(true)
    try {
      const res = await fetch('/api/v1/ikazin/admin/plan', {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      })
      if (res.ok) {
        const data = await res.json()
        setPlanList(data.users ?? [])
      }
    } catch {
      // silent
    } finally {
      setListLoading(false)
    }
  }

  async function submitAssignment(targetEmail: string, targetPlan: PlanTier) {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/v1/ikazin/admin/activate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          email: targetEmail,
          plan: targetPlan,
          org_slug: orgSlug,
          source: 'admin_ui',
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: `Plano ${targetPlan} atribuído para ${targetEmail}` })
        setEmail('')
        setConfirmDowngradeOpen(false)
        setPendingAssignment(null)
        loadPlanList()
      } else {
        setResult({ ok: false, message: data.detail ?? `Erro ${res.status}` })
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Erro desconhecido' })
    } finally {
      setLoading(false)
    }
  }

  function getCurrentPlanForEmail(targetEmail: string): PlanTier {
    const normalized = targetEmail.trim().toLowerCase()
    const match = planList.find((entry) => entry.email.trim().toLowerCase() === normalized)
    if (!match) return 'none'
    return PLAN_TIERS.includes(match.plan_tier as PlanTier) ? (match.plan_tier as PlanTier) : 'none'
  }

  function isDowngrade(currentPlan: PlanTier, nextPlan: PlanTier) {
    return PLAN_RANK[nextPlan] < PLAN_RANK[currentPlan]
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    const normalizedEmail = email.trim()
    if (!normalizedEmail) return

    const currentPlan = getCurrentPlanForEmail(normalizedEmail)
    if (isDowngrade(currentPlan, plan)) {
      setPendingAssignment({
        email: normalizedEmail,
        currentPlan,
        nextPlan: plan,
      })
      setConfirmDowngradeOpen(true)
      return
    }

    await submitAssignment(normalizedEmail, plan)
  }

  const currentPlan = getCurrentPlanForEmail(email)

  if (status === 'loading') return null

  if (!isSuperadmin) {
    return (
      <main className="min-h-screen bg-[#0a0e0d] text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Acesso restrito a superadmin.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0e0d] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white">Admin Ikazin — Planos</h1>
        <p className="mt-1 text-sm text-zinc-400">Atribuir ou remover plano de um usuário.</p>

        <form onSubmit={(e) => void handleAssign(e)} className="mt-8 space-y-4 rounded-[20px] border border-zinc-800 bg-[#141a18] p-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
              Email do usuário
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              placeholder="usuario@exemplo.com"
            />
            {email.trim() ? (
              <p className="mt-2 text-xs text-zinc-500">
                Plano atual detectado: <span className="font-semibold capitalize text-zinc-300">{currentPlan}</span>
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-zinc-300">
              Plano
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value as PlanTier)}
              className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            >
              {PLAN_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t === 'none' ? 'Remover acesso' : t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="orgslug" className="block text-sm font-medium text-zinc-300">
              Org slug (para link de boas-vindas)
            </label>
            <input
              id="orgslug"
              type="text"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {result ? (
            <div
              className={[
                'rounded-xl border px-3 py-2 text-sm',
                result.ok
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-800 bg-red-950/40 text-red-300',
              ].join(' ')}
            >
              {result.message}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-emerald-500 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Atribuir plano'}
          </Button>
        </form>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-zinc-100">Usuários com plano ativo</h2>
          {listLoading ? (
            <p className="mt-3 text-sm text-zinc-500">Carregando...</p>
          ) : planList.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Nenhum usuário com plano ativo.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {planList.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#141a18] px-4 py-3"
                >
                  <span className="text-sm text-zinc-200">{entry.email}</span>
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold capitalize text-emerald-400">
                    {entry.plan_tier}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <IkazinModal
        open={confirmDowngradeOpen}
        onOpenChange={(open) => {
          setConfirmDowngradeOpen(open)
          if (!open) setPendingAssignment(null)
        }}
        title={pendingAssignment?.nextPlan === 'none' ? 'Remover acesso do usuario?' : 'Confirmar downgrade de plano'}
        description={
          pendingAssignment
            ? `O usuario ${pendingAssignment.email} sera alterado de ${pendingAssignment.currentPlan} para ${pendingAssignment.nextPlan}.`
            : 'Confirme a alteracao de plano.'
        }
        size="md"
        closeOnBackdrop={false}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setConfirmDowngradeOpen(false)
                setPendingAssignment(null)
              }}
              className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/70 px-5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={loading || !pendingAssignment}
              onClick={() => pendingAssignment ? void submitAssignment(pendingAssignment.email, pendingAssignment.nextPlan) : undefined}
              className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Confirmar alteracao'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm leading-7 text-zinc-300">
          <p>
            {pendingAssignment?.nextPlan === 'none'
              ? 'Esta acao remove o acesso atual do usuario e afeta o fluxo de uso imediatamente.'
              : 'Esta acao reduz o nivel de acesso atual do usuario e pode bloquear builds e materiais ja liberados.'}
          </p>
          {pendingAssignment ? (
            <p>
              Usuario: <span className="font-semibold text-zinc-100">{pendingAssignment.email}</span><br />
              De: <span className="font-semibold capitalize text-zinc-100">{pendingAssignment.currentPlan}</span><br />
              Para: <span className="font-semibold capitalize text-zinc-100">{pendingAssignment.nextPlan}</span>
            </p>
          ) : null}
        </div>
      </IkazinModal>
    </main>
  )
}
