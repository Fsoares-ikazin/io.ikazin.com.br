'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Check, ChevronRight, Play, ArrowLeft, Cpu, Zap, BookOpen, Award, Lock } from 'lucide-react'
import { useMarketingLang, type Lang } from './LanguageToggle'
import { MarketingNav } from './MarketingNav'

// ─── Plan definitions ─────────────────────────────────────────────────────────

type Build = { number: number; title: string; description: string; tags: string[] }
type PlanDetail = {
  label: string
  price: { en: string; pt: string }
  priceNote: { en: string; pt: string }
  tagline: { en: string; pt: string }
  description: { en: string; pt: string }
  audience: { en: string; pt: string }
  builds: Build[]
  outcomes: { en: string[]; pt: string[] }
  color: string
  borderColor: string
}

const plans: Record<string, PlanDetail> = {
  basic: {
    label: 'BASIC',
    price: { en: '$69', pt: 'R$389' },
    priceNote: { en: 'one-time · lifetime access', pt: 'pagamento único · acesso vitalício' },
    tagline: { en: 'From zero to working PLC logic', pt: 'Do zero à lógica CLP funcionando' },
    description: {
      en: 'The foundation every automation engineer needs. Master Boolean logic, state machines, sensors and basic drives through 8 progressive builds inside a fully simulated industrial environment.',
      pt: 'A base que todo engenheiro de automação precisa. Domine lógica booleana, máquinas de estado, sensores e inversores básicos em 8 builds progressivos em um ambiente industrial totalmente simulado.',
    },
    audience: {
      en: 'Trainees, automation students, technicians making their first contact with PLC programming.',
      pt: 'Estagiários, estudantes de automação, técnicos tendo o primeiro contato com programação CLP.',
    },
    builds: [
      { number: 1, title: 'Boolean Logic Fundamentals', description: 'AND/OR/NOT gates, seal circuits and safety interlocks in Ladder', tags: ['Ladder', 'TIA Portal', 'S7-1200'] },
      { number: 2, title: 'Finite State Machine — Conveyor', description: 'FSM design for a 3-station conveyor with start/stop and fault states', tags: ['FSM', 'SCL', 'Digital Twin'] },
      { number: 3, title: 'Digital Sensor Integration', description: 'CTU/CTD counters, part detection, reject logic with physical I/O mapping', tags: ['Sensors', 'Counters', 'I/O'] },
      { number: 4, title: 'Analog Sensors & Scaling', description: 'Pressure and temperature sensors, 4–20 mA scaling, engineering unit conversion', tags: ['Analog', 'Scaling', 'PLC'] },
      { number: 5, title: 'Basic Drive Control — G120', description: 'SINA_SPEED block, speed ramp configuration and direction reversal via HMI', tags: ['G120', 'SINA_SPEED', 'Drives'] },
      { number: 6, title: 'Positioning with SINA_POS', description: 'Relative and absolute positioning, homing routines, position feedback', tags: ['G120', 'SINA_POS', 'Motion'] },
      { number: 7, title: 'HMI Basics with WinCC', description: 'Building operator screens, faceplates, alarms and runtime navigation', tags: ['WinCC', 'HMI', 'Alarms'] },
      { number: 8, title: 'Integrated Build — Bottling Line', description: 'Full Build integrating all BASIC concepts: conveyors, sensors, drive and HMI', tags: ['Integration', 'Capstone', 'Digital Twin'] },
    ],
    outcomes: {
      en: ['Write safe, structured PLC logic from scratch', 'Design FSM for real industrial sequences', 'Integrate drives with SINA_SPEED / SINA_POS', 'Build operator HMI screens in WinCC', 'Validate all logic via Digital Twin before hardware'],
      pt: ['Escrever lógica CLP segura e estruturada do zero', 'Projetar MEF para sequências industriais reais', 'Integrar inversores com SINA_SPEED / SINA_POS', 'Construir telas de operador em WinCC', 'Validar toda lógica via Gêmeo Digital antes do hardware'],
    },
    color: 'text-gray-400',
    borderColor: 'border-gray-700',
  },
  essentials: {
    label: 'ESSENTIALS',
    price: { en: '$119', pt: 'R$669' },
    priceNote: { en: 'one-time · lifetime access', pt: 'pagamento único · acesso vitalício' },
    tagline: { en: 'Real machines. Real logic. Real problems.', pt: 'Máquinas reais. Lógica real. Problemas reais.' },
    description: {
      en: 'Expand beyond the basics to full industrial applications. PID control, packaging lines, stretch film winding and multi-axis sequences with real-world complexity.',
      pt: 'Expanda além do básico para aplicações industriais completas. Controle PID, linhas de embalagem, enrolamento de filme stretch e sequências multi-eixo com complexidade real.',
    },
    audience: {
      en: 'Operators moving into programming roles, senior technicians, supervisors who need to understand and validate logic.',
      pt: 'Operadores migrando para funções de programação, técnicos sênior, supervisores que precisam entender e validar a lógica.',
    },
    builds: [
      { number: 9, title: 'Full PID Control Loop', description: 'Temperature and pressure PID from scratch: tuning, anti-windup, bumpless transfer', tags: ['PID', 'Control', 'Tuning'] },
      { number: 10, title: 'Packaging Line Sequence', description: 'Multi-station packaging: filling, sealing, labeling and reject with fault recovery', tags: ['Sequence', 'Multi-station', 'HMI'] },
      { number: 11, title: 'Stretch Film Winder', description: 'Tension control via dancer arm, analog feedback and ramp management', tags: ['Winder', 'Tension', 'Analog'] },
      { number: 12, title: 'Fault Management System', description: 'Structured alarm matrix, fault history, maintenance mode and safe restart', tags: ['Alarms', 'Safety', 'UDT'] },
      { number: 13, title: 'Integrated Build — Production Cell', description: 'Full ESSENTIALS capstone: multi-station cell with PID, drives, HMI and alarm system', tags: ['Integration', 'Capstone', 'Digital Twin'] },
    ],
    outcomes: {
      en: ['Implement full PID loops with proper tuning', 'Program complex multi-station sequences', 'Design fault management and alarm systems', 'Build industrial HMI with production data', 'Commission packaging and winding applications'],
      pt: ['Implementar loops PID completos com ajuste correto', 'Programar sequências complexas multi-estação', 'Projetar sistemas de gerenciamento de falhas e alarmes', 'Construir HMI industrial com dados de produção', 'Comissionar aplicações de embalagem e enrolamento'],
    },
    color: 'text-blue-400',
    borderColor: 'border-blue-800',
  },
  advanced: {
    label: 'ADVANCED',
    price: { en: '$159', pt: 'R$899' },
    priceNote: { en: 'one-time · lifetime access', pt: 'pagamento único · acesso vitalício' },
    tagline: { en: 'The level Siemens integrators actually need', pt: 'O nível que integradores Siemens realmente precisam' },
    description: {
      en: 'Enter the world of SINAMICS S120 multi-axis drives. Electronic gearing, Rotary Knife, winder tension control and position synchronization — the applications that separate junior from senior engineers.',
      pt: 'Entre no mundo dos drives multi-eixo SINAMICS S120. Acoplamento eletrônico, Rotary Knife, controle de tensão em enroladores e sincronização de posição — as aplicações que separam engenheiros júnior de sênior.',
    },
    audience: {
      en: 'Engineers targeting Siemens drive specialist roles, motion control applications, integration projects requiring S120.',
      pt: 'Engenheiros visando papéis de especialista em drives Siemens, aplicações de motion control, projetos de integração que requerem S120.',
    },
    builds: [
      { number: 14, title: 'SINAMICS S120 Commissioning', description: 'Drive topology, motor data entry, encoder feedback and first motion via STARTER', tags: ['S120', 'STARTER', 'Commissioning'] },
      { number: 15, title: 'Speed Control with MC_MoveVelocity', description: 'MC_Power, MC_Home, MC_MoveVelocity — PLCopen motion blocks in real application', tags: ['PLCopen', 'Motion', 'S120'] },
      { number: 16, title: 'Electronic Gearing', description: 'Master-slave gearing ratio, phase alignment and flying saw synchronization', tags: ['Gearing', 'Sync', 'Flying Saw'] },
      { number: 17, title: 'Rotary Knife Application', description: 'Position-based cut-on-the-fly: knife synchronization with conveyor speed, cut length control', tags: ['Rotary Knife', 'Position', 'Cam'] },
      { number: 18, title: 'Winder Tension Control', description: 'Diameter calculation, taper tension, dancer position control on multi-roll winder', tags: ['Winder', 'Tension', 'S120'] },
    ],
    outcomes: {
      en: ['Commission SINAMICS S120 drives from scratch', 'Implement PLCopen motion control blocks', 'Design electronic gearing and synchronization', 'Build Rotary Knife and flying saw applications', 'Control winder tension with diameter compensation'],
      pt: ['Comissionar drives SINAMICS S120 do zero', 'Implementar blocos de motion control PLCopen', 'Projetar acoplamento eletrônico e sincronização', 'Construir aplicações Rotary Knife e flying saw', 'Controlar tensão em enroladores com compensação de diâmetro'],
    },
    color: 'text-[#3587A4]',
    borderColor: 'border-[#3587A4]',
  },
  premium: {
    label: 'PREMIUM',
    price: { en: '$209', pt: 'R$1.179' },
    priceNote: { en: 'one-time · lifetime access', pt: 'pagamento único · acesso vitalício' },
    tagline: { en: 'Robotics, CNC and SIMOTION D', pt: 'Robótica, CNC e SIMOTION D' },
    description: {
      en: 'The complete journey. SCARA and Delta robots, full CNC G-code programming and the SIMOTION D workbench — the toolset required for OEM machine builders and senior integration engineers.',
      pt: 'A jornada completa. Robôs SCARA e Delta, programação CNC G-code completa e o workbench SIMOTION D — o conjunto de ferramentas exigido por construtores de máquinas OEM e engenheiros de integração sênior.',
    },
    audience: {
      en: 'Senior engineers, OEM machine builders, integration leads targeting complex motion and robotics applications.',
      pt: 'Engenheiros sênior, construtores de máquinas OEM, líderes de integração visando aplicações complexas de motion e robótica.',
    },
    builds: [
      { number: 19, title: 'SCARA Robot Kinematics', description: 'Forward/inverse kinematics, workspace mapping and pick-and-place programming in TIA Portal', tags: ['SCARA', 'Kinematics', 'Robot'] },
      { number: 20, title: 'Delta Robot — High Speed Pick', description: 'Delta robot inverse kinematics, parallel axis coordination and vision trigger integration', tags: ['Delta', 'High Speed', 'Vision'] },
      { number: 21, title: 'CNC Milling — G-code 2D', description: 'G00/G01/G02/G03 paths, tool compensation, canned cycles and part programs', tags: ['CNC', 'G-code', '2D'] },
      { number: 22, title: 'CNC 3D Contouring', description: '3D surface machining, spline interpolation and multi-axis coordination', tags: ['CNC', '3D', 'Spline'] },
      { number: 23, title: 'SIMOTION D — First Application', description: 'SCOUT workbench, technology objects, cam profiles and camming sequences', tags: ['SIMOTION', 'SCOUT', 'TO'] },
      { number: 24, title: 'SIMOTION D — Cam Design', description: 'Electronic cam curve design, cam synchronization and multi-axis cam coordination', tags: ['SIMOTION', 'Cam', 'Sync'] },
      { number: 25, title: 'Integrated Build — OEM Machine', description: 'Full PREMIUM capstone: robot, CNC and SIMOTION D coordinated in a complete machine simulation', tags: ['Integration', 'Capstone', 'OEM'] },
    ],
    outcomes: {
      en: ['Program SCARA and Delta robots in TIA Portal', 'Write CNC part programs in G-code 2D and 3D', 'Commission SIMOTION D with technology objects', 'Design electronic cam profiles and sequences', 'Integrate robotics, CNC and motion in one machine'],
      pt: ['Programar robôs SCARA e Delta no TIA Portal', 'Escrever programas CNC em G-code 2D e 3D', 'Comissionar SIMOTION D com technology objects', 'Projetar perfis de cam eletrônico e sequências', 'Integrar robótica, CNC e motion em uma máquina'],
    },
    color: 'text-purple-400',
    borderColor: 'border-purple-800',
  },
  'premium-plus': {
    label: 'PREMIUM PLUS',
    price: { en: '$1,229/p', pt: 'R$6.939/p' },
    priceNote: { en: 'per person · min. 8 participants', pt: 'por pessoa · mín. 8 participantes' },
    tagline: { en: 'In-person training with real industrial equipment', pt: 'Treinamento presencial com equipamentos industriais reais' },
    description: {
      en: 'The full immersive experience: on-site training with real Siemens hardware, production environment, specialized technical coaching and a certificate of completion.',
      pt: 'A experiência imersiva completa: treinamento presencial com hardware Siemens real, ambiente de produção, coaching técnico especializado e certificado de conclusão.',
    },
    audience: {
      en: 'Engineering teams, companies investing in upskilling their automation workforce.',
      pt: 'Equipes de engenharia, empresas investindo na capacitação de sua força de trabalho em automação.',
    },
    builds: [],
    outcomes: {
      en: ['Real hardware commissioning experience', 'Direct mentoring from Siemens specialists', 'Team-based project execution', 'Certificate of completion', 'Access to all online builds included'],
      pt: ['Experiência real de comissionamento com hardware', 'Mentoria direta de especialistas Siemens', 'Execução de projetos em equipe', 'Certificado de conclusão', 'Acesso a todos os builds online incluídos'],
    },
    color: 'text-amber-400',
    borderColor: 'border-amber-700',
  },
}

// ─── Video player ─────────────────────────────────────────────────────────────

function DemoVideo({ title }: { title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  return (
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <button
            onClick={() => { videoRef.current?.play(); setPlaying(true) }}
            aria-label="Play demo"
            className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-all hover:scale-110 hover:border-[#3587A4] hover:bg-[rgba(53,135,164,0.2)]"
          >
            <Play size={22} className="translate-x-0.5 text-white group-hover:text-[#3587A4]" fill="currentColor" />
          </button>
          <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
        </div>
      )}
      <div className="absolute bottom-3 right-3 rounded-md border border-[rgba(53,135,164,0.3)] bg-[#0F1419]/80 px-2.5 py-1 text-[10px] font-bold text-[#3587A4] backdrop-blur-sm">
        TIA Portal + Digital Twin
      </div>
    </div>
  )
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    nav: { plans: 'Plans', blog: 'Blog', cta: 'Access Platform' },
    back: 'All Plans',
    outcomes: 'What you will be able to do',
    buildsTitle: 'Builds included',
    buyNow: 'Enroll Now',
    oneTime: 'One-time payment',
    lifetime: 'Lifetime access',
    demoTitle: 'Preview demo',
    coming: 'Video coming soon',
    audience: 'Who is this for',
    contactCta: 'Request Training',
  },
  pt: {
    nav: { plans: 'Planos', blog: 'Blog', cta: 'Acessar Plataforma' },
    back: 'Todos os Planos',
    outcomes: 'O que você vai conseguir fazer',
    buildsTitle: 'Builds incluídos',
    buyNow: 'Matricular Agora',
    oneTime: 'Pagamento único',
    lifetime: 'Acesso vitalício',
    demoTitle: 'Preview demo',
    coming: 'Vídeo em breve',
    audience: 'Para quem é',
    contactCta: 'Solicitar Treinamento',
  },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PlanoDetailClient({ slug }: { slug: string }) {
  const [lang, setLang] = useMarketingLang()
  const t = copy[lang]
  const plan = plans[slug]

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-gray-100">
        <MarketingNav lang={lang} onLangChange={setLang} copy={t.nav} />
        <div className="flex flex-col items-center justify-center py-40">
          <p className="text-gray-400">Plan not found.</p>
          <Link href="/planos" className="mt-4 text-[#3587A4] hover:underline">{t.back}</Link>
        </div>
      </div>
    )
  }

  const isPremiumPlus = slug === 'premium-plus'

  return (
    <div className="min-h-screen bg-[#0F1419] text-gray-100">
      <MarketingNav lang={lang} onLangChange={setLang} copy={t.nav} />

      {/* Header */}
      <section className={`px-6 py-16 border-b border-[#2D2D2D]`} style={{ background: 'linear-gradient(180deg, rgba(53,135,164,0.04) 0%, transparent 100%)' }}>
        <div className="mx-auto max-w-7xl">
          <Link href="/planos" className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors">
            <ArrowLeft size={13} /> {t.back}
          </Link>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="flex-1">
              <div className={`mb-2 text-xs font-black tracking-widest ${plan.color}`}>{plan.label}</div>
              <h1 className="mb-3 text-4xl font-black tracking-tight text-white md:text-5xl leading-tight">
                {plan.tagline[lang]}
              </h1>
              <p className="mb-6 text-gray-400 leading-relaxed max-w-xl">{plan.description[lang]}</p>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Zap size={12} className="text-[#3587A4]" /> {t.oneTime}
                </div>
                <div className="w-px h-3 bg-[#2D2D2D]" />
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <BookOpen size={12} className="text-[#3587A4]" /> {t.lifetime}
                </div>
              </div>
              <div className="mb-2 text-4xl font-black text-white">{plan.price[lang]}</div>
              <div className="mb-8 text-xs text-gray-500">{plan.priceNote[lang]}</div>
              {isPremiumPlus ? (
                <Link href="/planos#contact" className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-4 text-sm font-bold text-white hover:opacity-90 transition-opacity">
                  {t.contactCta} <ChevronRight size={16} />
                </Link>
              ) : (
                <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#3587A4] px-8 py-4 text-sm font-bold text-white hover:opacity-90 transition-opacity">
                  {t.buyNow} <ChevronRight size={16} />
                </Link>
              )}
            </div>

            {/* Outcomes */}
            <div className={`rounded-2xl border ${plan.borderColor} bg-[#1F1F1F] p-6 lg:w-80 shrink-0`}>
              <div className="flex items-center gap-2 mb-4">
                <Award size={16} className={plan.color} />
                <h3 className="font-bold text-white text-sm">{t.outcomes}</h3>
              </div>
              <ul className="space-y-3">
                {plan.outcomes[lang].map((o, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check size={14} className="mt-0.5 shrink-0 text-[#3587A4]" /> {o}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-5 border-t border-[#2D2D2D]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t.audience}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{plan.audience[lang]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo video */}
      <section className="px-6 py-16 border-b border-[#2D2D2D]">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-black text-white">{t.demoTitle}</h2>
          <DemoVideo title={plan.tagline[lang]} />
          <p className="mt-3 text-xs text-gray-600 text-center">
            {lang === 'en' ? 'Demo video · Specific build demonstrations coming soon' : 'Vídeo de demonstração · Demos específicas de cada build em breve'}
          </p>
        </div>
      </section>

      {/* Builds list */}
      {plan.builds.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-xl font-black text-white">{t.buildsTitle} <span className={`text-sm font-semibold ${plan.color}`}>({plan.builds.length})</span></h2>
            <div className="space-y-3">
              {plan.builds.map((build, i) => (
                <div key={build.number} className="group flex gap-5 rounded-xl border border-[#2D2D2D] bg-[#1F1F1F] p-5 hover:border-[rgba(53,135,164,0.2)] transition-colors">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${i === plan.builds.length - 1 ? 'bg-[rgba(53,135,164,0.15)] text-[#3587A4]' : 'bg-[#2D2D2D] text-gray-500'}`}>
                    {build.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-bold text-white text-sm">{build.title}</h3>
                      <Lock size={12} className="text-gray-700 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{build.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {build.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-semibold text-gray-600 border border-[#2D2D2D] rounded px-1.5 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-20 text-center border-t border-[#2D2D2D]">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-3 text-2xl font-black text-white">{plan.tagline[lang]}</h2>
          <div className="mb-6 text-3xl font-black text-white">{plan.price[lang]}</div>
          {isPremiumPlus ? (
            <Link href="/planos#contact" className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-10 py-4 text-base font-bold text-white hover:opacity-90 transition-opacity">
              {t.contactCta} <ChevronRight size={16} />
            </Link>
          ) : (
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#3587A4] px-10 py-4 text-base font-bold text-white hover:opacity-90 transition-opacity">
              {t.buyNow} <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2D2D2D] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-600 md:flex-row">
          <span>© {new Date().getFullYear()} Ikazin®. {lang === 'en' ? 'All rights reserved.' : 'Todos os direitos reservados.'}</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
