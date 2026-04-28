'use client'

import Link from 'next/link'
import { Cpu, Box, Award, ChevronRight, Zap, Play, AlertTriangle, TrendingUp } from 'lucide-react'
import { useMarketingLang, type Lang } from './LanguageToggle'
import { MarketingNav } from './MarketingNav'

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    nav: { plans: 'Plans', blog: 'Blog', cta: 'Access Platform' },
    badge: '25 Builds · 5 Levels · 100% Online',
    painBadge: 'The problem nobody talks about',
    painTitle: 'You train on paper. Industry runs on PLC.',
    painSub: 'Most automation courses teach theory, diagrams and static screenshots. But real machines don\'t run on theory — they run on tested, debugged, validated logic. When you arrive on-site, the gap between what you learned and what runs on that controller can cost hours, days or an entire commissioning.',
    painStats: [
      { number: '83%', label: 'of engineers admit they learned commissioning only on their first real job' },
      { number: '40h+', label: 'average time lost debugging logic that was never simulated before deployment' },
      { number: '$12k', label: 'average cost of a production stop caused by startup logic errors' },
    ],
    headline: 'Close the gap.',
    headlineAccent: 'Program real PLCs. Without physical hardware.',
    sub: '25 progressive builds with Digital Twin. From Boolean logic to SIMOTION D robotics. Simulate, debug and validate before the machine exists.',
    ctaPrimary: 'See Plans',
    ctaSecondary: 'Explore Builds',
    videoTitle: 'See what Digital Twin looks like in practice',
    videoSub: 'TIA Portal communicating with a 3D virtual machine in real time. No hardware. Full logic validation.',
    videoPlay: 'Play demo',
    pillarsTitle: 'Three things you will never learn from slides',
    pillars: [
      {
        title: 'Real PLC behavior',
        body: 'Debug scan cycles, resolve signal conflicts, tune PID — all in a controlled environment that behaves exactly like the real controller.',
      },
      {
        title: 'Digital Twin integration',
        body: 'Connect TIA Portal to a 3D model via S7 protocol. Actuators move, sensors respond, alarms trigger — before the machine is assembled.',
      },
      {
        title: 'Documented portfolio',
        body: 'Every build generates traceable evidence of your work — not a certificate from a course nobody heard of, but actual project files.',
      },
    ],
    tiersTitle: 'Choose where to enter',
    tiersSub: 'From the absolute beginner to the SIMOTION D specialist. Each level unlocks the next.',
    tierCta: 'See builds',
    tierDetails: 'Details & demos',
    tiersCtaSingle: 'Explore all levels',
    techTitle: 'The same tools industry demands',
    finalTitle: 'How long can you afford to be the engineer who never simulated anything?',
    finalSub: 'Every week without real practice is another week behind the engineer who already has 25 projects in the portfolio.',
    previewTitle: '25 builds. Real. Numbered.',
    previewCta: 'See plans',
    finalCta: 'Start Today',
    footerCopy: 'All rights reserved.',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms',
  },
  pt: {
    nav: { plans: 'Planos', blog: 'Blog', cta: 'Acessar Plataforma' },
    badge: '25 Builds · 5 Níveis · 100% Online',
    painBadge: 'O problema que ninguém fala',
    painTitle: 'Você treina no papel. A indústria roda no PLC.',
    painSub: 'A maioria dos cursos de automação ensina teoria, diagramas e prints estáticos. Mas máquinas reais não rodam em teoria — rodam em lógica testada, depurada e validada. Quando você chega na obra, a distância entre o que aprendeu e o que está rodando naquele controlador pode custar horas, dias ou um comissionamento inteiro.',
    painStats: [
      { number: '83%', label: 'dos engenheiros admitem que aprenderam comissionamento só no primeiro emprego real' },
      { number: '40h+', label: 'de tempo médio perdido depurando lógica que nunca foi simulada antes do startup' },
      { number: 'R$60k', label: 'custo médio de uma parada de produção causada por erros de lógica no startup' },
    ],
    headline: 'Feche o gap.',
    headlineAccent: 'Programe PLCs reais. Sem precisar de hardware.',
    sub: '25 builds progressivos com Gêmeo Digital. Da lógica booleana à robótica SIMOTION D. Simule, depure e valide antes da máquina existir.',
    ctaPrimary: 'Ver Planos',
    ctaSecondary: 'Explorar Builds',
    videoTitle: 'Veja como é o Gêmeo Digital na prática',
    videoSub: 'TIA Portal se comunicando com uma máquina virtual 3D em tempo real. Sem hardware. Validação completa da lógica.',
    videoPlay: 'Reproduzir demo',
    pillarsTitle: 'Três coisas que você nunca aprende em slides',
    pillars: [
      {
        title: 'Comportamento real do PLC',
        body: 'Depure ciclos de scan, resolva conflitos de sinal, ajuste PID — tudo em um ambiente controlado que se comporta exatamente como o controlador real.',
      },
      {
        title: 'Integração com Gêmeo Digital',
        body: 'Conecte o TIA Portal a um modelo 3D via protocolo S7. Atuadores se movem, sensores respondem, alarmes disparam — antes da máquina ser montada.',
      },
      {
        title: 'Portfólio documentado',
        body: 'Cada build gera evidência rastreável do seu trabalho — não um certificado de um curso que ninguém conhece, mas arquivos reais de projeto.',
      },
    ],
    tiersTitle: 'Escolha por onde entrar',
    tiersSub: 'Do iniciante absoluto ao especialista SIMOTION D. Cada nível desbloqueia o próximo.',
    tierCta: 'Ver builds',
    tierDetails: 'Detalhes & demos',
    tiersCtaSingle: 'Explorar todos os níveis',
    techTitle: 'As mesmas ferramentas que a indústria exige',
    finalTitle: 'Por quanto tempo você pode ser o engenheiro que nunca simulou nada?',
    finalSub: 'Cada semana sem prática real é mais uma semana atrás do engenheiro que já tem 25 projetos no portfólio.',
    previewTitle: '25 builds. Reais. Numerados.',
    previewCta: 'Ver planos',
    finalCta: 'Começar Hoje',
    footerCopy: 'Todos os direitos reservados.',
    footerPrivacy: 'Privacidade',
    footerTerms: 'Termos',
  },
}

// ─── Tier data ─────────────────────────────────────────────────────────────────

type TierCopy = {
  label: string
  slug: string
  price: string
  builds: string
  audience: string
  features: string[]
  tagline: string
  featured?: boolean
}

const tierData: Record<Lang, TierCopy[]> = {
  en: [
    {
      label: 'BASIC', slug: 'basic', price: '$69',
      builds: 'Builds 1–8',
      audience: 'Trainees and automation students',
      tagline: 'PLC from zero. No physical hardware needed.',
      features: ['Boolean logic, FSM, interlocks', 'Digital/analog sensors (CTU/CTD)', 'G120 SINA_SPEED / SINA_POS'],
    },
    {
      label: 'ESSENTIALS', slug: 'essentials', price: '$119',
      builds: 'Builds 9–13',
      audience: 'Operators, senior technicians, supervisors',
      tagline: 'Real machines. Full PID. Industrial complexity.',
      features: ['Real industrial applications', 'Full PID control', 'Packaging & stretch film lines'],
    },
    {
      label: 'ADVANCED', slug: 'advanced', price: '$159',
      builds: 'Builds 14–18',
      audience: 'Siemens drive specialists & motion engineers',
      tagline: 'S120 multi-axis. The level the industry actually demands.',
      features: ['SINAMICS S120 speed & position', 'Electronic gearing & Rotary Knife', 'Winder tension control'],
      featured: true,
    },
    {
      label: 'PREMIUM', slug: 'premium', price: '$209',
      builds: 'Builds 19–25',
      audience: 'Senior engineers, integrators, OEMs',
      tagline: 'Robotics, CNC G-code & SIMOTION D. Full machine builder toolkit.',
      features: ['SCARA & Delta robots', 'CNC G-code 2D/3D', 'SIMOTION D full workbench'],
    },
  ],
  pt: [
    {
      label: 'BASIC', slug: 'basic', price: 'R$399',
      builds: 'Builds 1–8',
      audience: 'Estagiários e estudantes de automação',
      tagline: 'CLP do zero. Sem hardware físico necessário.',
      features: ['Lógica booleana e FSM', 'Sensores digitais e analógicos', 'Inversores G120 SINA_SPEED'],
    },
    {
      label: 'ESSENTIALS', slug: 'essentials', price: 'R$699',
      builds: 'Builds 9–13',
      audience: 'Técnicos sênior e supervisores',
      tagline: 'Máquinas reais. PID completo. Complexidade industrial.',
      features: ['Aplicações industriais reais', 'Controle PID completo', 'Linhas de embalagem e envolvimento'],
    },
    {
      label: 'ADVANCED', slug: 'advanced', price: 'R$899',
      builds: 'Builds 14–18',
      audience: 'Especialistas em drives Siemens',
      tagline: 'S120 multi-eixo. O nível que a indústria realmente exige.',
      features: ['SINAMICS S120 velocidade e posição', 'Acoplamento eletrônico e Rotary Knife', 'Controle de tensão em enroladores'],
      featured: true,
    },
    {
      label: 'PREMIUM', slug: 'premium', price: 'R$1.199',
      builds: 'Builds 19–25',
      audience: 'Engenheiros sênior e integradores',
      tagline: 'Robótica, CNC G-code e SIMOTION D. Kit completo de construtor de máquinas.',
      features: ['Robôs SCARA e Delta', 'CNC G-code 2D/3D', 'SIMOTION D workbench completo'],
    },
  ],
}

const tierStyle = [
  { color: 'text-gray-400', borderColor: 'border-gray-800', badgeColor: 'bg-gray-800 text-gray-400' },
  { color: 'text-blue-400', borderColor: 'border-blue-900/50', badgeColor: 'bg-blue-900/50 text-blue-400' },
  { color: 'text-ikz-lime', borderColor: 'border-ikz-lime', badgeColor: 'bg-ikz-lime/15 text-ikz-lime', featured: true },
  { color: 'text-purple-400', borderColor: 'border-purple-900/50', badgeColor: 'bg-purple-900/50 text-purple-400' },
]

// ─── Build Preview Data ───────────────────────────────────────────────────────

type BuildTierRow = {
  label: string
  labelColor: string
  builds: { code: string; title: string }[]
}

const buildPreviewRows: BuildTierRow[] = [
  {
    label: 'BASIC',
    labelColor: 'text-gray-400',
    builds: [
      { code: 'B1', title: 'Boolean Logic Fundamentals' },
      { code: 'B2', title: 'Timer & Counter Basics' },
      { code: 'B3', title: 'Motion Axis Fundamentals' },
      { code: 'B4', title: 'Sensor Integration (Digital/Analog)' },
      { code: 'B5', title: 'HMI Basic Screens' },
      { code: 'B6', title: 'Safety PLCopen Basics' },
      { code: 'B7', title: 'Drive Commissioning V/F' },
      { code: 'B8', title: 'Fieldbus Intro (PROFINET)' },
    ],
  },
  {
    label: 'ESSENTIALS',
    labelColor: 'text-blue-400',
    builds: [
      { code: 'B9', title: 'PID Control Loop' },
      { code: 'B10', title: 'Cam Profile Basics' },
      { code: 'B11', title: 'Synchronized Axes' },
      { code: 'B12', title: 'Flying Shear' },
      { code: 'B13', title: 'Conveyor + Reject System' },
    ],
  },
  {
    label: 'ADVANCED',
    labelColor: 'text-ikz-lime',
    builds: [
      { code: 'B14', title: 'SINAMICS S120 Commissioning' },
      { code: 'B15', title: 'Multi-Axis Coordinated Motion' },
      { code: 'B16', title: 'CNC G-Code Interpreter' },
      { code: 'B17', title: 'Rotary Knife' },
      { code: 'B18', title: 'Winding/Unwinding Tension Control' },
    ],
  },
  {
    label: 'PREMIUM',
    labelColor: 'text-purple-400',
    builds: [
      { code: 'B19', title: 'Complete Packaging Machine' },
      { code: 'B20', title: 'Robot Cell Integration (KUKA/ABB)' },
      { code: 'B21', title: 'Vision System + Reject' },
      { code: 'B22', title: 'SIMOTION D Advanced' },
      { code: 'B23', title: 'OPC-UA Data Layer' },
      { code: 'B24', title: 'Digital Twin Commissioning' },
      { code: 'B25', title: 'Integrated OEM Machine' },
    ],
  },
]

// ─── BuildPreviewStrip ────────────────────────────────────────────────────────

function BuildPreviewStrip({ previewTitle, previewCta }: { previewTitle: string; previewCta: string }) {
  return (
    <section className="px-6 py-20 border-t border-ikz-border">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-center text-2xl font-black tracking-tight text-white">{previewTitle}</h2>
        <div className="flex flex-col gap-6">
          {buildPreviewRows.map((row) => (
            <div key={row.label} className="flex items-start gap-4">
              {/* Tier label */}
              <div className={`w-24 shrink-0 pt-2.5 text-[10px] font-black tracking-widest ${row.labelColor}`}>
                {row.label}
              </div>
              {/* Scrollable strip */}
              <div className="relative min-w-0 flex-1">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                  {row.builds.map((b) => (
                    <div
                      key={b.code}
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-ikz-border bg-ikz-surface px-3 py-2"
                    >
                      <span className={`text-[10px] font-black tabular-nums ${row.labelColor}`}>{b.code}</span>
                      <span className="whitespace-nowrap text-xs text-gray-300">{b.title}</span>
                    </div>
                  ))}
                </div>
                {/* Fade-right gradient */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ikz-bg to-transparent" />
              </div>
            </div>
          ))}
        </div>
        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/planos"
            className="inline-flex items-center gap-2 rounded-xl bg-ikz-lime shadow-glow-lime hover:shadow-glow-lime-lg px-8 py-4 text-sm font-bold text-ikz-bg transition-all hover:opacity-90"
          >
            {previewCta} <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── VideoSection ─────────────────────────────────────────────────────────────

const YOUTUBE_PLACEHOLDER = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

function VideoSection({ title, sub, playLabel }: { title: string; sub: string; playLabel: string }) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="mx-auto max-w-xl text-sm text-gray-400">{sub}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-ikz-border bg-ikz-surface aspect-video flex flex-col items-center justify-center gap-6">
          {/* Gradient badge */}
          <div className="rounded-full border border-ikz-cyan/30 bg-gradient-to-r from-ikz-cyan/10 to-ikz-lime/10 px-5 py-2 text-xs font-black uppercase tracking-widest">
            <span className="bg-gradient-to-r from-ikz-cyan to-ikz-lime bg-clip-text text-transparent">
              Digital Twin · TIA Portal V18
            </span>
          </div>
          {/* Play button → YouTube */}
          <button
            onClick={() => window.open(YOUTUBE_PLACEHOLDER, '_blank')}
            aria-label={playLabel}
            className="group flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm transition-all hover:scale-110 hover:border-ikz-cyan hover:bg-ikz-cyan/15"
          >
            <Play size={28} className="translate-x-0.5 text-white group-hover:text-ikz-cyan" fill="currentColor" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{playLabel}</span>
          {/* Corner badge */}
          <div className="absolute bottom-4 right-4 rounded-lg border border-ikz-cyan/30 bg-ikz-bg/80 px-3 py-1.5 text-xs font-bold text-ikz-cyan backdrop-blur-sm">
            TIA Portal + Digital Twin
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function LandingClient() {
  const [lang, setLang] = useMarketingLang()
  const t = copy[lang]
  const tiers = tierData[lang]

  return (
    <div className="min-h-screen bg-ikz-bg text-gray-100">
      <MarketingNav lang={lang} onLangChange={setLang} copy={t.nav} />

      {/* Pain section */}
      <section className="relative overflow-hidden px-6 py-20 border-b border-ikz-border">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{ width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(239,68,68,0.04) 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-900/40 bg-red-950/20 px-4 py-1.5 text-xs font-semibold text-red-400">
            <AlertTriangle size={12} /> {t.painBadge}
          </div>
          <h2 className="mb-5 text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl leading-tight">
            {t.painTitle}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-base text-gray-400 leading-relaxed">{t.painSub}</p>
          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-3">
            {t.painStats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-ikz-border bg-ikz-surface px-6 py-5 transition-all hover:-translate-y-0.5">
                <div className="mb-1 text-3xl font-black text-red-400">{stat.number}</div>
                <div className="text-xs text-gray-500 leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero — the solution */}
      <section className="relative overflow-hidden px-6 py-28 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4"
          style={{ width: 800, height: 600, background: 'radial-gradient(circle, hsl(var(--ikz-lime) / 0.1) 0%, hsl(var(--ikz-cyan) / 0.08) 40%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ikz-cyan/25 bg-ikz-cyan/10 px-4 py-1.5 text-xs font-semibold text-ikz-cyan">
            <Zap size={12} /> {t.badge}
          </div>
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            {t.headline}{' '}
            <span className="bg-gradient-to-r from-ikz-lime to-ikz-cyan bg-clip-text text-transparent">{t.headlineAccent}</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 leading-relaxed">{t.sub}</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/planos" className="rounded-xl bg-ikz-lime shadow-glow-lime hover:shadow-glow-lime-lg px-8 py-4 text-sm font-bold text-ikz-bg transition-all hover:opacity-90 flex items-center gap-2">
              {t.ctaPrimary} <ChevronRight size={16} />
            </Link>
            <Link href="#builds" className="rounded-xl border border-ikz-border px-8 py-4 text-sm font-semibold text-gray-300 transition-colors hover:border-gray-600 hover:text-white">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Video demo */}
      <VideoSection title={t.videoTitle} sub={t.videoSub} playLabel={t.videoPlay} />

      {/* Pillars */}
      <section className="px-6 py-20 border-t border-ikz-border">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-2xl font-black tracking-tight text-white">{t.pillarsTitle}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {([Cpu, Box, Award] as const).map((Icon, i) => {
              const isLime = i % 2 === 0
              return (
              <div key={i} className={`rounded-2xl border border-ikz-border bg-ikz-surface p-8 transition-colors ${isLime ? 'hover:border-ikz-lime/30' : 'hover:border-ikz-cyan/30'}`}>
                <div className={`mb-4 inline-flex rounded-xl p-3 ${isLime ? 'bg-ikz-lime/10' : 'bg-ikz-cyan/10'}`}>
                  <Icon size={22} className={isLime ? 'text-ikz-lime' : 'text-ikz-cyan'} />
                </div>
                <h3 className="mb-2 font-bold text-white">{t.pillars[i].title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{t.pillars[i].body}</p>
              </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tier Cards */}
      <section id="builds" className="px-6 py-20 border-t border-ikz-border">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-2xl font-black tracking-tight text-white">{t.tiersTitle}</h2>
          <p className="mb-12 text-center text-gray-400">{t.tiersSub}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier, i) => {
              const style = tierStyle[i]
              return (
                <Link
                  key={tier.label}
                  href={`/planos/${tier.slug}`}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border ${style.borderColor} bg-ikz-surface p-6 transition-all hover:-translate-y-1 ${tier.featured ? 'ring-1 ring-ikz-lime/30' : ''}`}
                >
                  {/* Featured accent line */}
                  {tier.featured && (
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ikz-lime to-transparent" />
                  )}
                  <div className={`mb-3 text-[10px] font-black tracking-widest ${style.color}`}>{tier.label}</div>
                  <p className="flex-1 text-sm leading-snug text-gray-300 group-hover:text-white transition-colors">{tier.tagline}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-600">{tier.builds}</span>
                    <ChevronRight size={13} className={`transition-transform group-hover:translate-x-0.5 ${style.color}`} />
                  </div>
                </Link>
              )
            })}
          </div>
          {/* Single CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/planos"
              className="inline-flex items-center gap-2 rounded-xl bg-ikz-lime shadow-glow-lime hover:shadow-glow-lime-lg px-8 py-4 text-sm font-bold text-ikz-bg transition-all hover:opacity-90"
            >
              {t.tiersCtaSingle} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Build Preview Strip */}
      <BuildPreviewStrip previewTitle={t.previewTitle} previewCta={t.previewCta} />

      {/* Tech strip */}
      <section className="border-y border-ikz-border px-6 py-8">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-gray-600">{t.techTitle}</p>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {['Siemens S7-1500', 'SINAMICS S120', 'TIA Portal V18', 'WinCC Unified', 'SIMOTION D', 'RealVirtual · Unity'].map((tech) => (
            <span key={tech} className="text-sm font-semibold text-gray-600 hover:text-gray-400 transition-colors">{tech}</span>
          ))}
        </div>
      </section>

      {/* Final CTA — urgency */}
      <section className="px-6 py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ikz-cyan/20 bg-ikz-cyan/5 px-4 py-1.5 text-xs font-semibold text-gray-400">
            <TrendingUp size={12} className="text-ikz-cyan" /> {lang === 'en' ? 'Every week counts' : 'Cada semana conta'}
          </div>
          <h2 className="mb-5 text-3xl font-black tracking-tight text-white md:text-5xl leading-tight">
            {t.finalTitle}
          </h2>
          <p className="mb-10 text-gray-400 max-w-xl mx-auto">{t.finalSub}</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/planos" className="inline-flex items-center gap-2 rounded-xl bg-ikz-lime shadow-glow-lime hover:shadow-glow-lime-lg px-10 py-4 text-base font-bold text-ikz-bg transition-all hover:opacity-90">
              {t.finalCta} <ChevronRight size={16} />
            </Link>
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-xl border border-ikz-border px-8 py-4 text-sm font-semibold text-gray-400 hover:border-gray-600 hover:text-white transition-colors">
              {lang === 'en' ? 'Read the blog' : 'Ler o blog'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ikz-border px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-600 md:flex-row">
          <span>© {new Date().getFullYear()} Ikazin.io. {t.footerCopy}</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">{t.footerPrivacy}</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">{t.footerTerms}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
