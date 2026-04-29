'use client'

import React from 'react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getAPIUrl } from '@services/config/config'
import { swrFetcher } from '@services/utils/ts/requests'
import useSWR from 'swr'
import NetflixHero from '@components/Landings/NetflixHero'
import NetflixRow from '@components/Landings/NetflixRow'
import { Bot, Cpu, Factory, Gauge, GraduationCap, MonitorCog } from 'lucide-react'

interface LandingClassicProps {
  courses: any[]
  collections: any[]
  orgslug: string
  org_id: string | number
  headline?: string
  subtitle?: string
}

function LandingClassic({ courses, collections, orgslug, org_id, headline, subtitle }: LandingClassicProps) {
  const session = useLHSession() as any
  const org = useOrg() as any
  const token = session?.data?.tokens?.access_token
  const orgID = org?.id

  const { data: trail } = useSWR(
    token && orgID ? `${getAPIUrl()}trail/org/${orgID}/trail` : null,
    (url) => swrFetcher(url, token),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const trailRuns: any[] = trail?.runs ?? []
  const inProgressRuns = trailRuns.filter(
    (r) => r.course_total_steps > 0 && r.steps.length < r.course_total_steps
  )
  const inProgressIds = new Set(inProgressRuns.map((r) => r.course.course_uuid))

  // Build rows
  const publishedCourses = courses.filter((c) => c.published !== false)
  const featuredCourse = publishedCourses[0] ?? courses[0] ?? null

  // Courses per collection
  const collectionRows = collections.map((col: any) => ({
    title: col.name as string,
    courses: publishedCourses.filter((c: any) =>
      col.courses?.some((cc: any) => cc.course_uuid === c.course_uuid || cc === c.course_uuid)
    ),
  })).filter((r) => r.courses.length > 0)

  // Courses NOT in any collection → "Todos os cursos" fallback
  const collectionCourseIds = new Set(
    collections.flatMap((col: any) =>
      (col.courses ?? []).map((cc: any) => cc.course_uuid ?? cc)
    )
  )
  const uncategorised = publishedCourses.filter((c) => !collectionCourseIds.has(c.course_uuid))

  const learningTracks = [
    {
      title: 'CLP Siemens',
      description: 'Do raciocínio ladder à lógica de automação aplicada em painéis, máquinas e processos industriais.',
      icon: Cpu,
    },
    {
      title: 'SINAMICS',
      description: 'Parametrização, comissionamento e diagnóstico de drives para aplicações reais de movimento.',
      icon: Gauge,
    },
    {
      title: 'Digital Twin',
      description: 'Validação de lógica e operação com simulações antes de levar alterações para o chão de fábrica.',
      icon: MonitorCog,
    },
    {
      title: 'Projetos hands-on',
      description: 'Aulas orientadas a prática, com cenários industriais e exercícios para construir portfólio técnico.',
      icon: Factory,
    },
  ]

  const outcomes = [
    'Interpretar e construir lógica de automação industrial',
    'Comissionar sistemas Siemens com mais segurança',
    'Testar soluções em ambiente simulado antes da aplicação real',
  ]

  return (
    <div className="w-full bg-ikz-bg text-ikz-text">
      {/* Hero */}
      <NetflixHero course={featuredCourse} orgslug={orgslug} headline={headline} subtitle={subtitle} />

      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <section className="mb-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-ikz-border bg-ikz-surface/80 p-5 shadow-lg shadow-black/20 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ikz-cyan/15 text-ikz-cyan">
                <Bot size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ikz-cyan">Escopo Ikazin.io</p>
                <h2 className="text-xl font-bold text-white">Automação industrial aplicada</h2>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {learningTracks.map((track) => {
                const Icon = track.icon
                return (
                  <div key={track.title} className="rounded-lg border border-ikz-border bg-ikz-bg/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-ikz-cyan">
                      <Icon size={18} />
                      <h3 className="text-sm font-bold text-ikz-text">{track.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-400">{track.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-ikz-border bg-ikz-surface/80 p-5 shadow-lg shadow-black/20 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ikz-cyan/15 text-ikz-cyan">
                <GraduationCap size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ikz-cyan">Resultado esperado</p>
                <h2 className="text-xl font-bold text-white">Do estudo à execução</h2>
              </div>
            </div>
            <div className="space-y-3">
              {outcomes.map((outcome) => (
                <div key={outcome} className="rounded-lg border border-ikz-border bg-ikz-bg/70 px-4 py-3 text-sm text-gray-300">
                  {outcome}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rows */}
        {/* Continue Watching */}
        {inProgressRuns.length > 0 && (
          <NetflixRow
            title="Continue seu treinamento"
            courses={inProgressRuns.map((r) => r.course)}
            orgslug={orgslug}
            trailRuns={inProgressRuns}
          />
        )}

        {/* Collection rows */}
        {collectionRows.map((row) => (
          <NetflixRow
            key={row.title}
            title={row.title}
            courses={row.courses}
            orgslug={orgslug}
            trailRuns={trailRuns}
          />
        ))}

        {/* Uncategorised or all courses */}
        {uncategorised.length > 0 && (
          <NetflixRow
            title={collectionRows.length > 0 ? 'Mais formações técnicas' : 'Catálogo técnico'}
            courses={uncategorised}
            orgslug={orgslug}
            trailRuns={trailRuns}
          />
        )}

        {/* Empty state */}
        {publishedCourses.length === 0 && (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-ikz-border bg-ikz-surface/70 px-6 py-24 text-center shadow-lg shadow-black/20">
            <p className="mb-2 text-sm font-semibold text-ikz-text">Nenhum curso disponível ainda.</p>
            <p className="text-xs text-gray-400">Os cursos publicados aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingClassic
