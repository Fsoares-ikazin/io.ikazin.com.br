'use client'

import React from 'react'
import Link from 'next/link'
import { useOrg } from '@components/Contexts/OrgContext'
import { getCourseThumbnailMediaDirectory } from '@services/media/media'
import { getUriWithOrg } from '@services/config/config'
import { Play, Info } from 'lucide-react'

interface NetflixHeroProps {
  course: any
  orgslug: string
  headline?: string
  subtitle?: string
}

export default function NetflixHero({ course, orgslug, headline, subtitle }: NetflixHeroProps) {
  const org = useOrg() as any
  if (!course && !headline) return null

  const courseid = course?.course_uuid?.replace('course_', '')
  const thumbnail =
    course?.thumbnail_image && org?.org_uuid
      ? getCourseThumbnailMediaDirectory(org.org_uuid, course.course_uuid, course.thumbnail_image)
      : null
  const courseLink = courseid ? getUriWithOrg(orgslug, '/course/' + courseid) : getUriWithOrg(orgslug, '/courses')

  return (
    <section className="relative w-full overflow-hidden bg-ikz-bg">
      {/* Backdrop image */}
      {thumbnail ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 scale-105"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ikz-surface to-ikz-bg" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ikz-bg via-transparent to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[420px] w-full max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 md:min-h-[520px] md:pb-16 lg:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-ikz-cyan">
            Portal do aluno Ikazin.io
          </span>
          <h1 className="text-3xl font-black leading-tight text-ikz-cyan sm:text-4xl md:text-6xl">
            {headline || course?.name}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ikz-text md:text-lg">
              {subtitle}
            </p>
          )}
          {course?.name && (
            <p className="mt-5 max-w-xl text-sm text-gray-300 md:text-base">
              Curso em destaque: <span className="font-semibold text-white">{course.name}</span>
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {['CLP Siemens', 'SINAMICS', 'Digital Twin', 'Simulações hands-on'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-ikz-cyan/30 bg-ikz-cyan/10 px-3 py-1 text-xs font-semibold text-ikz-text"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={courseLink}
              className="inline-flex items-center gap-2 rounded-lg bg-ikz-cyan px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-ikz-cyan/90 active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              Assistir agora
            </Link>
            <Link
              href={courseLink}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <Info size={16} />
              Mais detalhes
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
