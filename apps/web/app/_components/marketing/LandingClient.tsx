'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Cpu, Box, Award, Check, ChevronRight, Zap, Play, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
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
    techTitle: 'The same tools industry demands',
    finalTitle: 'How long can you afford to be the engineer who never simulated anything?',
    finalSub: 'Every week without real practice is another week behind the engineer who already has 25 projects in the portfolio.',
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
    techTitle: 'As mesmas ferramentas que a indústria exige',
    finalTitle: 'Por quanto tempo você pode ser o engenheiro que nunca simulou nada?',
    finalSub: 'Cada semana sem prática real é mais uma semana atrás do engenheiro que já tem 25 projetos no portfólio.',
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
  featured?: boolean
}

const tierData: Record<Lang, TierCopy[]> = {
  en: [
    {
      label: 'BASIC', slug: 'basic', price: '$69',
      builds: 'Builds 1–8',
      audience: 'Trainees and automation students',
      features: ['Boolean logic, FSM, interlocks', 'Digital/analog sensors (CTU/CTD)', 'G120 SINA_SPEED / SINA_POS'],
    },
    {
      label: 'ESSENTIALS', slug: 'essentials', price: '$119',
      builds: 'Builds 9–13',
      audience: 'Operators, senior technicians, supervisors',
      features: ['Real industrial applications', 'Full PID control', 'Packaging & stretch film lines'],
    },
    {
      label: 'ADVANCED', slug: 'advanced', price: '$159',
      builds: 'Builds 14–18',
      audience: 'Siemens drive specialists & motion engineers',
      features: ['SINAMICS S120 speed & position', 'Electronic gearing & Rotary Knife', 'Winder tension control'],
      featured: true,
    },
    {
      label: 'PREMIUM', slug: 'premium', price: '$209',
      builds: 'Builds 19–25',
      audience: 'Senior engineers, integrators, OEMs',
      features: ['SCARA & Delta robots', 'CNC G-code 2D/3D', 'SIMOTION D full workbench'],
    },
  ],
  pt: [
    {
      label: 'BASIC', slug: 'basic', price: 'R$389',
      builds: 'Builds 1–8',
      audience: 'Estagiários e estudantes de automação',
      features: ['Lógica booleana e FSM', 'Sensores digitais e analógicos', 'Inversores G120 SINA_SPEED'],
    },
    {
      label: 'ESSENTIALS', slug: 'essentials', price: 'R$669',
      builds: 'Builds 9–13',
      audience: 'Técnicos sênior e supervisores',
      features: ['Aplicações industriais reais', 'Controle PID completo', 'Linhas de embalagem e envolvimento'],
    },
    {
      label: 'ADVANCED', slug: 'advanced', price: 'R$899',
      builds: 'Builds 14–18',
      audience: 'Especialistas em drives Siemens',
      features: ['SINAMICS S120 velocidade e posição', 'Acoplamento eletrônico e Rotary Knife', 'Controle de tensão em enroladores'],
      featured: true,
    },
    {
      label: 'PREMIUM', slug: 'premium', price: 'R$1.179',
      builds: 'Builds 19–25',
      audience: 'Engenheiros sênior e integradores',
      features: ['Robôs SCARA e Delta', 'CNC G-code 2D/3D', 'SIMOTION D workbench completo'],
    },
  ],
}

const tierStyle = [
  { color: 'text-gray-400', borderColor: 'border-gray-800', badgeColor: 'bg-gray-800 text-gray-400' },
  { color: 'text-blue-400', borderColor: 'border-blue-900/50', badgeColor: 'bg-blue-900/50 text-blue-400' },
  { color: 'text-[#3587A4]', borderColor: 'border-[#3587A4]', badgeColor: 'bg-[rgba(53,135,164,0.15)] text-[#3587A4]', featured: true },
  { color: 'text-purple-400', borderColor: 'border-purple-900/50', badgeColor: 'bg-purple-900/50 text-purple-400' },
]

// ─── VideoSection ─────────────────────────────────────────────────────────────

function VideoSection({ title, sub, playLabel }: { title: string; sub: string; playLabel: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="mx-auto max-w-xl text-sm text-gray-400">{sub}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[#2D2D2D] bg-[#0A0A0A] aspect-video">
          <video
            ref={videoRef}
            src="/video-hero.mp4"
            className="w-full h-full object-cover"
            loop
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {!playing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
              <button
                onClick={handlePlay}
                aria-label={playLabel}
                className="group flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-all hover:scale-110 hover:border-[#3587A4] hover:bg-[rgba(53,135,164,0.2)]"
              >
                <Play size={28} className="translate-x-0.5 text-white group-hover:text-[#3587A4]" fill="currentColor" />
              </button>
              <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">{playLabel}</span>
            </div>
          )}
          {/* Corner badge */}
          <div className="absolute bottom-4 right-4 rounded-lg border border-[rgba(53,135,164,0.3)] bg-[#0F1419]/80 px-3 py-1.5 text-xs font-bold text-[#3587A4] backdrop-blur-sm">
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
    <div className="min-h-screen bg-[#0F1419] text-gray-100">
      <MarketingNav lang={lang} onLangChange={setLang} copy={t.nav} />

      {/* Pain section */}
      <section className="relative overflow-hidden px-6 py-20 border-b border-[#2D2D2D]">
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
              <div key={i} className="rounded-xl border border-[#2D2D2D] bg-[#1F1F1F] px-6 py-5">
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
          style={{ width: 800, height: 600, background: 'radial-gradient(circle, rgba(53,135,164,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(53,135,164,0.25)] bg-[rgba(53,135,164,0.07)] px-4 py-1.5 text-xs font-semibold text-[#3587A4]">
            <Zap size={12} /> {t.badge}
          </div>
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            {t.headline}{' '}
            <span className="text-[#3587A4]">{t.headlineAccent}</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 leading-relaxed">{t.sub}</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/planos" className="rounded-xl bg-[#3587A4] px-8 py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-2">
              {t.ctaPrimary} <ChevronRight size={16} />
            </Link>
            <Link href="#builds" className="rounded-xl border border-[#2D2D2D] px-8 py-4 text-sm font-semibold text-gray-300 transition-colors hover:border-gray-600 hover:text-white">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Video demo */}
      <VideoSection title={t.videoTitle} sub={t.videoSub} playLabel={t.videoPlay} />

      {/* Pillars */}
      <section className="px-6 py-20 border-t border-[#2D2D2D]">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-2xl font-black tracking-tight text-white">{t.pillarsTitle}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {([Cpu, Box, Award] as const).map((Icon, i) => (
              <div key={i} className="rounded-2xl border border-[#2D2D2D] bg-[#1F1F1F] p-8 transition-colors hover:border-[rgba(53,135,164,0.2)]">
                <div className="mb-4 inline-flex rounded-xl bg-[rgba(53,135,164,0.1)] p-3">
                  <Icon size={22} className="text-[#3587A4]" />
                </div>
                <h3 className="mb-2 font-bold text-white">{t.pillars[i].title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{t.pillars[i].body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier Cards */}
      <section id="builds" className="px-6 py-20 border-t border-[#2D2D2D]">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-2xl font-black tracking-tight text-white">{t.tiersTitle}</h2>
          <p className="mb-12 text-center text-gray-400">{t.tiersSub}</p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier, i) => {
              const style = tierStyle[i]
              return (
                <div
                  key={tier.label}
                  className={`relative flex flex-col rounded-2xl border ${style.borderColor} bg-[#1F1F1F] p-6 transition-all hover:scale-[1.02] ${tier.featured ? 'ring-1 ring-[#3587A4]/40' : ''}`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#3587A4] px-3 py-0.5 text-xs font-bold text-white whitespace-nowrap">
                      {lang === 'en' ? 'Most Popular' : 'Mais Popular'}
                    </div>
                  )}
                  <div className={`mb-1 text-xs font-black tracking-widest ${style.color}`}>{tier.label}</div>
                  <div className="mb-1 text-2xl font-black text-white">{tier.price}</div>
                  <div className="mb-1 text-xs font-semibold text-gray-500">{tier.builds}</div>
                  <div className="mb-5 text-xs italic text-gray-500">{tier.audience}</div>
                  <ul className="mb-6 space-y-2 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                        <Check size={13} className="mt-0.5 shrink-0 text-[#3587A4]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    <Link
                      href={`/planos/${tier.slug}`}
                      className="block rounded-lg border border-[#2D2D2D] py-2 text-center text-xs font-semibold text-gray-400 hover:border-gray-600 hover:text-white transition-colors"
                    >
                      {t.tierDetails}
                    </Link>
                    <Link
                      href="/planos"
                      className={`block rounded-lg py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                        tier.featured ? 'bg-[#3587A4] text-white' : 'border border-[#2D2D2D] text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {t.tierCta}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tech strip */}
      <section className="border-y border-[#2D2D2D] px-6 py-8">
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(53,135,164,0.2)] bg-[rgba(53,135,164,0.05)] px-4 py-1.5 text-xs font-semibold text-gray-400">
            <TrendingUp size={12} className="text-[#3587A4]" /> {lang === 'en' ? 'Every week counts' : 'Cada semana conta'}
          </div>
          <h2 className="mb-5 text-3xl font-black tracking-tight text-white md:text-5xl leading-tight">
            {t.finalTitle}
          </h2>
          <p className="mb-10 text-gray-400 max-w-xl mx-auto">{t.finalSub}</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/planos" className="inline-flex items-center gap-2 rounded-xl bg-[#3587A4] px-10 py-4 text-base font-bold text-white transition-opacity hover:opacity-90">
              {t.finalCta} <ChevronRight size={16} />
            </Link>
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-xl border border-[#2D2D2D] px-8 py-4 text-sm font-semibold text-gray-400 hover:border-gray-600 hover:text-white transition-colors">
              {lang === 'en' ? 'Read the blog' : 'Ler o blog'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2D2D2D] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-600 md:flex-row">
          <span>© {new Date().getFullYear()} Ikazin®. {t.footerCopy}</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">{t.footerPrivacy}</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">{t.footerTerms}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
