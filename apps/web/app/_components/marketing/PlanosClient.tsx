'use client'

import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'
import { useMarketingLang, type Lang } from './LanguageToggle'
import { MarketingNav } from './MarketingNav'
import { TierCard } from '@components/ikazin/marketing/TierCard'

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    nav: { back: 'Back', audience: 'Who it’s for', blog: 'Blog', login: 'Sign in', cta: 'Start now' },
    title: 'Choose your level of mastery',
    sub: 'From fundamentals to SIMOTION D. Start where you are, reach where you need to be.',
    badge: 'One-time payment · Lifetime access',
    mostPopular: 'Most Popular',
    priceNote: 'one-time payment',
    ctaPrefix: 'Start with',
    ppTitle: 'In-Person Training',
    ppSub: 'Training with real industrial equipment. Production environment, specialized technical coaching and certificate of completion.',
    ppParticipants: 'Min. 8 participants',
    ppClass: '$9,832 per class',
    ppPerPerson: 'per person',
    ppCta: 'Request Training',
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'Do I need physical hardware?', a: 'No. Everything runs on simulation via Digital Twin. The virtual environment faithfully replicates real PLC behavior.' },
      { q: 'What is the difference between levels?', a: 'Each level advances in complexity: BASIC covers fundamentals, ESSENTIALS applies to real machines, ADVANCED enters Siemens motion control, PREMIUM covers robotics and advanced CNC.' },
      { q: 'Does access expire?', a: 'No. One-time payment, lifetime access to all builds at the purchased level.' },
    ],
    contactTitle: 'Questions? Get in touch.',
  },
  pt: {
    nav: { back: 'Voltar', audience: 'Para quem é', blog: 'Blog', login: 'Entrar', cta: 'Começar agora' },
    title: 'Escolha seu nível de domínio',
    sub: 'Do fundamentos ao SIMOTION D. Comece onde você está, chegue onde precisa.',
    badge: 'Pagamento único · Acesso vitalício',
    mostPopular: 'Mais Popular',
    priceNote: 'pagamento único',
    ctaPrefix: 'Começar com',
    ppTitle: 'Treinamento Presencial',
    ppSub: 'Treinamento com equipamentos industriais reais. Ambiente de produção real, coaching técnico especializado e certificado de conclusão.',
    ppParticipants: 'Mínimo 8 participantes',
    ppClass: '$9.832 por turma',
    ppPerPerson: 'por pessoa',
    ppCta: 'Solicitar Treinamento',
    faqTitle: 'Perguntas frequentes',
    faq: [
      { q: 'Preciso de hardware físico?', a: 'Não. Tudo roda em simulação via Gêmeo Digital. O ambiente virtual replica fielmente o comportamento do PLC real.' },
      { q: 'Qual a diferença entre os níveis?', a: 'Cada nível avança em complexidade: BASIC cobre fundamentos, ESSENTIALS aplica em máquinas reais, ADVANCED entra em motion control Siemens, PREMIUM cobre robótica e CNC avançado.' },
      { q: 'O acesso expira?', a: 'Não. Pagamento único, acesso vitalício a todos os builds do nível adquirido.' },
    ],
    contactTitle: 'Dúvidas? Fale conosco.',
  },
}

// ─── Tier data ─────────────────────────────────────────────────────────────────

type TierData = {
  label: string; price: string; builds: string; audience: string; features: string[]
  style: { badge: string; border: string; cta: 'primary' | 'outline'; featured?: boolean }
}

const tierData: Record<Lang, TierData[]> = {
  en: [
    {
      label: 'BASIC', price: '$69', builds: 'Builds 1–8', audience: 'Trainees and automation students',
      features: ['Boolean logic, FSM, interlocks', 'Digital sensors (CTU/CTD, edge detection)', 'Analog sensors 0–10V / 4–20mA', 'Hysteresis level control', 'G120 SINA_SPEED & SINA_POS', 'Master/slave synchronism'],
      style: { badge: 'bg-gray-800 text-gray-400', border: 'border-gray-800', cta: 'outline' },
    },
    {
      label: 'ESSENTIALS', price: '$119', builds: 'Builds 9–13', audience: 'Operators, senior technicians, supervisors',
      features: ['Rotary diverter conveyor (multi-axis)', 'Stretch film machine with HMI', 'Flow Pack line — conveyor sync', 'PID level control (P, PI, PID)', 'Ball & Beam — advanced instability'],
      style: { badge: 'bg-blue-900/50 text-blue-400', border: 'border-blue-900/50', cta: 'outline' },
    },
    {
      label: 'ADVANCED', price: '$159', builds: 'Builds 14–18', audience: 'Siemens drive specialists & motion engineers',
      features: ['SINAMICS S120 — MoveVelocity real-time', 'SINAMICS S120 — MoveAbsolute / MoveRelative', 'Electronic gearing GearIn / GearInAbsolute', 'Rotary Knife with cam profiles', 'Winder / Dancer Roll tension control'],
      style: { badge: 'bg-ikz-lime/15 text-ikz-lime', border: 'border-ikz-lime', cta: 'primary', featured: true },
    },
    {
      label: 'PREMIUM', price: '$209', builds: 'Builds 19–25', audience: 'Senior engineers, integrators, OEMs',
      features: ['Pick & Place — Cartesian kinematics', 'Cut / Fill On The Fly', 'SCARA robot — direct & inverse kinematics', 'Delta robot — high-speed multi-axis', 'CNC G-code — 2D/3D trajectory', 'SIMOTION D — full workbench'],
      style: { badge: 'bg-purple-900/50 text-purple-400', border: 'border-purple-900/50', cta: 'outline' },
    },
  ],
  pt: [
    {
      label: 'BASIC', price: 'R$399', builds: 'Builds 1–8', audience: 'Estagiários e estudantes de automação',
      features: ['Lógica booleana, FSM e intertravamentos', 'Sensores digitais (CTU/CTD, borda)', 'Sensores analógicos 0–10V / 4–20mA', 'Controle de nível por histerese', 'Inversor G120 SINA_SPEED e SINA_POS', 'Sincronismo master/slave'],
      style: { badge: 'bg-gray-800 text-gray-400', border: 'border-gray-800', cta: 'outline' },
    },
    {
      label: 'ESSENTIALS', price: 'R$699', builds: 'Builds 9–13', audience: 'Operadores, técnicos sênior e supervisores',
      features: ['Desvio giratório multi-eixo', 'Máquina de filme stretch com HMI', 'Linha Flow Pack — sincronismo de esteira', 'Controle PID de nível (P, PI, PID)', 'Ball & Beam — sistema instável avançado'],
      style: { badge: 'bg-blue-900/50 text-blue-400', border: 'border-blue-900/50', cta: 'outline' },
    },
    {
      label: 'ADVANCED', price: 'R$899', builds: 'Builds 14–18', audience: 'Especialistas em drives Siemens e engenheiros de motion',
      features: ['SINAMICS S120 — MoveVelocity real-time', 'SINAMICS S120 — MoveAbsolute / MoveRelative', 'Acoplamento eletrônico GearIn / GearInAbsolute', 'Rotary Knife com perfis de came', 'Enroladores com controle de tensão'],
      style: { badge: 'bg-ikz-lime/15 text-ikz-lime', border: 'border-ikz-lime', cta: 'primary', featured: true },
    },
    {
      label: 'PREMIUM', price: 'R$1.199', builds: 'Builds 19–25', audience: 'Engenheiros sênior, integradores e fabricantes',
      features: ['Pick & Place — cinemática cartesiana', 'Cut / Fill On The Fly', 'Robô SCARA — cinemática direta e inversa', 'Robô Delta — alta velocidade multi-eixo', 'CNC G-code — trajetória 2D/3D', 'SIMOTION D — workbench completo'],
      style: { badge: 'bg-purple-900/50 text-purple-400', border: 'border-purple-900/50', cta: 'outline' },
    },
  ],
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PlanosClient() {
  const [lang, setLang] = useMarketingLang()
  const t = copy[lang]
  const tiers = tierData[lang]

  return (
    <div className="min-h-screen bg-ikz-bg text-gray-100">
      <MarketingNav
        lang={lang}
        onLangChange={setLang}
        copy={{
          plans: lang === 'en' ? 'Plans' : 'Planos',
          audience: t.nav.audience,
          blog: t.nav.blog,
          login: t.nav.login,
          cta: t.nav.cta,
        }}
      />

      {/* Header */}
      <section className="px-6 py-20 text-center">
        <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl">{t.title}</h1>
        <p className="mx-auto mb-3 max-w-2xl text-lg text-gray-400">{t.sub}</p>
        <p className="text-sm font-semibold text-ikz-cyan">{t.badge}</p>
      </section>

      {/* Tier grid */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <TierCard
              key={tier.label}
              tier={tier}
              ctaPrefix={t.ctaPrefix}
              priceNote={t.priceNote}
              mostPopular={t.mostPopular}
            />
          ))}
        </div>
      </section>

      {/* Premium Plus */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-amber-900/50 bg-ikz-surface p-8 md:flex md:items-center md:justify-between md:gap-8">
            <div className="mb-6 md:mb-0">
              <div className="mb-3 inline-block rounded-full bg-amber-900/40 px-3 py-0.5 text-xs font-black tracking-widest text-amber-400">
                PREMIUM PLUS
              </div>
              <h3 className="mb-2 text-2xl font-black text-white">{t.ppTitle}</h3>
              <p className="max-w-lg text-sm leading-relaxed text-gray-400">{t.ppSub}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-amber-400" /> {t.ppParticipants}
                </span>
                <span className="font-semibold text-amber-400">{t.ppClass}</span>
              </div>
            </div>
            <div className="shrink-0 text-center">
              <div className="mb-1 text-4xl font-black text-white">$1,229</div>
              <div className="mb-5 text-xs text-zinc-300">{t.ppPerPerson}</div>
              <a
                href="mailto:contato@ikazin.com.br"
                className="block rounded-xl border border-amber-700 px-8 py-3 text-sm font-bold text-amber-400 transition-colors hover:bg-amber-900/20"
              >
                {t.ppCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-white">{t.faqTitle}</h2>
          <div className="space-y-4">
            {t.faq.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-ikz-border bg-ikz-surface">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-white list-none">
                  {q}
                  <ChevronRight size={16} className="text-zinc-300 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-6 pb-6 text-sm leading-relaxed text-gray-400">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-ikz-border px-6 py-16 text-center">
        <p className="mb-4 text-gray-400">{t.contactTitle}</p>
        <a href="mailto:contato@ikazin.com.br" className="text-sm font-semibold text-ikz-cyan hover:underline">
          contato@ikazin.com.br
        </a>
      </section>
    </div>
  )
}
