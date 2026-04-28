'use client'

import React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getAPIUrl, getUriWithOrg } from '@services/config/config'
import { swrFetcher } from '@services/utils/ts/requests'
import { getCourseThumbnailMediaDirectory } from '@services/media/media'
import { ArrowRight, BookOpen } from 'lucide-react'

interface ContinueLearningProps {
  orgslug: string
}

export default function ContinueLearning({ orgslug }: ContinueLearningProps) {
  const session = useLHSession() as any
  const org = useOrg() as any
  const token = session?.data?.tokens?.access_token
  const orgID = org?.id

  const { data: trail } = useSWR(
    token && orgID ? `${getAPIUrl()}trail/org/${orgID}/trail` : null,
    (url) => swrFetcher(url, token),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  if (!token || !trail) return null

  const inProgress = (trail.runs ?? []).filter(
    (run: any) => run.course_total_steps > 0 && run.steps.length < run.course_total_steps
  )

  if (inProgress.length === 0) return null

  const [featured, ...rest] = inProgress.slice(0, 4)

  const CourseCard = ({ run, compact }: { run: any; compact?: boolean }) => {
    const course = run.course
    const courseid = course.course_uuid.replace('course_', '')
    const completed = run.steps.length
    const total = run.course_total_steps
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    const thumbnail =
      course.thumbnail_image && org?.org_uuid
        ? getCourseThumbnailMediaDirectory(org.org_uuid, course.course_uuid, course.thumbnail_image)
        : null
    const href = getUriWithOrg(orgslug, '/course/' + courseid)

    if (compact) {
      return (
        <Link
          href={href}
          className="flex items-center gap-3 p-3 rounded-xl bg-ikz-surface border border-ikz-border hover:border-ikz-cyan/40 transition-colors group"
        >
          <div className="w-12 h-12 rounded-lg bg-ikz-bg overflow-hidden shrink-0 flex items-center justify-center">
            {thumbnail ? (
              <img src={thumbnail} alt={course.name} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={18} className="text-ikz-cyan/50" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-white">
              {course.name}
            </p>
            <div className="mt-1.5 h-1 w-full rounded-full bg-ikz-border overflow-hidden">
              <div
                className="h-full rounded-full bg-ikz-cyan"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-gray-500">{pct}% concluído</p>
          </div>
          <ArrowRight size={14} className="text-gray-600 group-hover:text-ikz-cyan shrink-0 transition-colors" />
        </Link>
      )
    }

    return (
      <Link
        href={href}
        className="relative flex flex-col rounded-2xl bg-ikz-surface border border-ikz-border hover:border-ikz-cyan/50 overflow-hidden transition-all group"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-ikz-bg">
          {thumbnail ? (
            <img src={thumbnail} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <BookOpen size={40} className="text-gray-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
            <div className="h-full bg-ikz-cyan" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="p-4 flex flex-col gap-1">
          <p className="text-sm font-bold text-gray-100 line-clamp-2 group-hover:text-white">
            {course.name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-ikz-cyan font-semibold">{pct}% concluído</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-ikz-cyan transition-colors">
              Continuar <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-200">Continue de onde parou</h2>
        <Link
          href={getUriWithOrg(orgslug, '/trail')}
          className="text-xs text-gray-500 hover:text-ikz-cyan transition-colors"
        >
          Ver tudo →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <CourseCard run={featured} />
        </div>
        {rest.length > 0 && (
          <div className="flex flex-col gap-3 justify-between">
            {rest.slice(0, 3).map((run: any) => (
              <CourseCard key={run.course.course_uuid} run={run} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
