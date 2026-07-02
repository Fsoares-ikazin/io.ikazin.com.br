'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { track } from '@/lib/ikazin/analytics'
import { signup } from '@services/auth/auth'
import { useAuth } from '@components/Contexts/AuthContext'
import { Lock, ShieldCheck, Zap, ChevronRight, AlertTriangle } from 'lucide-react'

const VALID_PLANS = ['basic', 'essentials', 'advanced', 'premium'] as const
type Plan = (typeof VALID_PLANS)[number]

const PLAN_INFO: Record<Plan, { label: string; price: string; builds: string; tagline: string; color: string }> = {
  basic:      { label: 'BASIC',      price: 'R$399',  builds: 'Builds 1–8',   tagline: 'Fundamentos de PLC e Gêmeo Digital',                       color: '#6366f1' },
  essentials: { label: 'ESSENTIALS', price: 'R$699',  builds: 'Builds 9–13',  tagline: 'Aplicações industriais reais com PID e multi-estação',     color: '#3b82f6' },
  advanced:   { label: 'ADVANCED',   price: 'R$899',  builds: 'Builds 14–18', tagline: 'Drives SINAMICS S120, motion control e acoplamento',       color: '#10b981' },
  premium:    { label: 'PREMIUM',    price: 'R$1.199', builds: 'Builds 19–25', tagline: 'Robótica SCARA/Delta, CNC G-code e SIMOTION D',           color: '#a855f7' },
}

export default function CheckoutPage({ params }: { params: Promise<{ orgslug: string }> }) {
  const resolvedParams = use(params)
  const orgslug = resolvedParams.orgslug
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useLHSession() as any
  const status = session?.status ?? 'loading'
  const { signIn } = useAuth()

  const plan = (searchParams.get('plan') ?? '').toLowerCase() as Plan
  const info = PLAN_INFO[plan]

  const [orgInfo, setOrgInfo] = useState<PlanInfo>({ id: null, err: null })
  // ─── Auth form state ───────────────────────────────────────────
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  type PlanInfo = { id: string | null; err: string | null }

  // ─── Fetch org ID on mount ──────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return
    let alive = true
    async function go() {
      try {
        // Use relative path so cookies flow same-origin
        const res = await fetch(`/api/v1/orgs/slug/${orgslug}`)
        if (!res.ok) {
          if (alive) setOrgInfo({ id: null, err: 'Erro ao carregar organização.' })
          return
        }
        const data = await res.json()
        if (alive) setOrgInfo({ id: data.id || null, err: null })
      } catch {
        if (alive) setOrgInfo({ id: null, err: 'Erro de conexão.' })
      }
    }
    go()
    return () => { alive = false }
  }, [orgslug, status])
  async function redirectToStripe(accessToken: string) {
    track('checkout_initiated', { plan })
    try {
      const res = await fetch('/api/v1/ikazin/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const detail = body.detail ?? 'Erro ao iniciar checkout.'
        track('checkout_error', { plan, error: detail, status: res.status })
        setErrorMsg(detail)
        setSubmitting(false)
        return
      }
      const { session_url } = await res.json()
      track('checkout_redirected', { plan })
      window.location.href = session_url
    } catch {
      setErrorMsg('Erro de conexão. Verifique sua internet.')
      setSubmitting(false)
    }
  }

  // ─── Handle signup → auto-checkout ─────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password || !orgInfo.id) return
    setSubmitting(true)
    setErrorMsg(null)

    const username = email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 6)
    const res = await signup({
      org_slug: orgslug,
      org_id: orgInfo.id,
      email: email.trim(),
      password,
      username,
      first_name: name.trim(),
      last_name: '',
      bio: '',
    })

    const body = await res.json().catch(() => ({}))
    // Parse FastAPI errors: string, or array of {type, loc, msg, input}
    const detail: string = Array.isArray(body.detail)
      ? body.detail.map((e: any) => String(e.msg || '')).filter(Boolean).join('. ')
      : (typeof body.detail === 'string' ? body.detail : '')

    if (res.status === 200) {
      // Success — sign in and go to Stripe
      await redirectToStripeAfterAuth(email.trim(), password)
      return
    }

    if (res.status === 503) {
      // Email service down but account created — proceed to Stripe anyway
      if (detail === 'Email already exists') {
        setErrorMsg('Este e-mail já tem cadastro. Faça login.')
        setMode('login')
        setSubmitting(false)
        return
      }
      await redirectToStripeAfterAuth(email.trim(), password)
      return
    }

    // Real error
    const ptErrors: Record<string, string> = {
      'Email already exists': 'Este e-mail já tem cadastro. Faça login.',
      'Username already exists': 'Escolha outro nome de usuário.',
    }
    setErrorMsg(ptErrors[detail] || detail || 'Erro ao criar conta. Tente novamente.')
    if (detail === 'Email already exists') setMode('login')
    setSubmitting(false)
  }

  // Shared: sign in after account creation, then go to Stripe
  async function redirectToStripeAfterAuth(loginEmail: string, loginPass: string) {
    const signInRes = await signIn('credentials', {
      redirect: false,
      email: loginEmail,
      password: loginPass,
      callbackUrl: window.location.origin,
    })
    if (signInRes?.error) {
      setErrorMsg('Conta criada! Faça login para continuar.')
      setMode('login')
      setSubmitting(false)
      return
    }
    // Poll for session token — context takes a moment to hydrate
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 700))
      await session.update?.(true)
      const token = session?.data?.tokens?.access_token
      if (token) {
        await redirectToStripe(token)
        return
      }
    }
    setErrorMsg('Conta criada! Recarregue a página para continuar.')
    setMode('login')
    setSubmitting(false)
  }

  // ─── Handle login → auto-checkout ──────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSubmitting(true)
    setErrorMsg(null)

    const res = await signIn('credentials', {
      redirect: false,
      email: email.trim(),
      password,
      callbackUrl: window.location.origin,
    })

    if (res && !res.error) {
      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 700))
        await session.update?.(true)
        const token = session?.data?.tokens?.access_token
        if (token) { await redirectToStripe(token); return }
      }
      setErrorMsg('Sessão não iniciada. Recarregue a página.')
      setSubmitting(false)
    } else {
      setErrorMsg('E-mail ou senha incorretos.')
      setSubmitting(false)
    }
  }

  // ─── Google OAuth (disabled until backend configured) ───────────
  // function handleGoogle() { ... }

  // ─── Already authenticated: go straight to Stripe ──────────────
  useEffect(() => {
    if (status !== 'authenticated') return
    const accessToken = session?.data?.tokens?.access_token
    if (!accessToken) return
    redirectToStripe(accessToken)
  }, [status])

  // ─── Invalid plan guard ────────────────────────────────────────
  useEffect(() => {
    if (!plan || !VALID_PLANS.includes(plan)) router.replace('/planos')
  }, [plan, router])

  // ─── Loading org data ──────────────────────────────────────────
  if (!info || (status !== 'authenticated' && !orgInfo.id && !orgInfo.err && status !== 'unauthenticated')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ikz-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ikz-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  // ─── Already authenticated → spinner (auto-redirects) ──────────
  if (status === 'authenticated' && !errorMsg) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ikz-bg text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Redirecionando para o checkout seguro…</p>
      </div>
    )
  }

  // ─── Auth form — join or login + checkout ──────────────────────
  return (
    <main className="min-h-screen bg-[#0a0e0d] text-zinc-100">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mb-3 inline-block rounded-full px-3 py-0.5 text-xs font-black tracking-widest"
            style={{ backgroundColor: info.color + '1a', color: info.color }}
          >
            {info.label}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {info.price} · {info.builds}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">{info.tagline}</p>
        </div>

        {/* Plan summary card */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-[#141a18] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Plano {info.label}</p>
              <p className="text-xs text-zinc-400">Pagamento único · Acesso vitalício</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{info.price}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1"><Lock size={12} className="text-emerald-400" /> SSL seguro</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-400" /> Pagamento Stripe</span>
            <span className="flex items-center gap-1"><Zap size={12} className="text-emerald-400" /> Acesso imediato</span>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-800/60 bg-red-950/30 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" />
            <p className="text-sm text-red-200">{errorMsg}</p>
          </div>
        )}

        {/* Auth Tabs */}
        <div className="mb-6 flex rounded-xl bg-zinc-900 p-1">
          <button
            onClick={() => { setMode('signup'); setErrorMsg(null) }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === 'signup' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Criar conta
          </button>
          <button
            onClick={() => { setMode('login'); setErrorMsg(null) }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === 'login' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Já tenho conta
          </button>
        </div>

        {/* Signup form */}
        {mode === 'signup' && (
          <form onSubmit={(e) => void handleSignup(e)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300">Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? 'Criando conta…' : `Comprar ${info.label} · ${info.price}`}
              {!submitting && <ChevronRight size={16} />}
            </button>
            <p className="text-center text-xs text-zinc-500">
              Ao criar sua conta você concorda com os{' '}
              <a href="/terms" target="_blank" className="underline hover:text-zinc-300">Termos de Serviço</a>.
            </p>
          </form>
        )}

        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Sua senha"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? 'Entrando…' : `Entrar e comprar ${info.label}`}
              {!submitting && <ChevronRight size={16} />}
            </button>
          </form>
        )}

        {/* Back link */}
        <p className="mt-6 text-center">
          <button onClick={() => router.back()} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Voltar aos planos
          </button>
        </p>
      </div>
    </main>
  )
}
