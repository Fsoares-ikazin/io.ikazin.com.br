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
}

export default function NetflixHero({ course, orgslug }: NetflixHeroProps) {
  const org = useOrg() as any
  if (!course) return null

  const courseid = course.course_uuid?.replace('course_', '')
  const thumbnail =
    course.thumbnail_image && org?.org_uuid
      ? getCourseThumbnailMediaDirectory(org.org_uuid, course.course_uuid, course.thumbnail_image)
      : null
  const courseLink = getUriWithOrg(orgslug, '/course/' + courseid)

  return (
    <div className="relative w-full aspect-[21/9] min-h-[320px] max-h-[560px] overflow-hidden bg-ikz-bg">
      {/* Backdrop image */}
      {thumbnail ? (
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ikz-surface to-ikz-bg" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ikz-bg via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-8 pb-12 md:px-16 md:pb-16 max-w-2xl">
        <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ikz-cyan">
          Em Destaque
        </span>
        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3 line-clamp-2">
          {course.name}
        </h2>
        {course.description && (
          <p className="text-sm md:text-base text-gray-300 line-clamp-2 mb-6 max-w-lg">
            {course.description}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Link
            href={courseLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ikz-cyan hover:bg-ikz-cyan/90 text-white font-bold text-sm rounded-lg transition-all active:scale-95"
          >
            <Play size={16} fill="currentColor" />
            Assistir agora
          </Link>
          <Link
            href={courseLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-sm rounded-lg border border-white/20 transition-all"
          >
            <Info size={16} />
            Mais detalhes
          </Link>
        </div>
      </div>
    </div>
  )
}
