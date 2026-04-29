'use client'

import React from 'react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getAPIUrl } from '@services/config/config'
import { swrFetcher } from '@services/utils/ts/requests'
import useSWR from 'swr'
import NetflixHero from '@components/Landings/NetflixHero'
import NetflixRow from '@components/Landings/NetflixRow'

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

  return (
    <div className="w-full bg-ikz-bg text-ikz-text">
      {/* Hero */}
      <NetflixHero course={featuredCourse} orgslug={orgslug} headline={headline} subtitle={subtitle} />

      {/* Rows */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        {/* Continue Watching */}
        {inProgressRuns.length > 0 && (
          <NetflixRow
            title="Continue Assistindo"
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
            title={collectionRows.length > 0 ? 'Mais cursos' : 'Todos os Cursos'}
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
