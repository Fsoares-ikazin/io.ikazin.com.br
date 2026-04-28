'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useOrg } from '@components/Contexts/OrgContext'
import { getCourseThumbnailMediaDirectory } from '@services/media/media'
import { getUriWithOrg } from '@services/config/config'
import { ChevronLeft, ChevronRight, Play, BookOpen } from 'lucide-react'

interface NetflixRowProps {
  title: string
  courses: any[]
  orgslug: string
  trailRuns?: any[]
}

function NetflixCard({ course, orgslug, trailRun }: { course: any; orgslug: string; trailRun?: any }) {
  const org = useOrg() as any
  const courseid = course.course_uuid?.replace('course_', '')
  const thumbnail =
    course.thumbnail_image && org?.org_uuid
      ? getCourseThumbnailMediaDirectory(org.org_uuid, course.course_uuid, course.thumbnail_image)
      : null
  const courseLink = getUriWithOrg(orgslug, '/course/' + courseid)

  const pct =
    trailRun && trailRun.course_total_steps > 0
      ? Math.round((trailRun.steps.length / trailRun.course_total_steps) * 100)
      : null

  return (
    <Link
      href={courseLink}
      prefetch={false}
      className="group relative shrink-0 w-[200px] md:w-[220px] lg:w-[240px] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-ikz-surface overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={course.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-ikz-surface">
            <BookOpen size={32} className="text-gray-700" />
          </div>
        )}

        {/* Progress bar */}
        {pct !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/60">
            <div
              className={`h-full ${pct >= 100 ? 'bg-green-500' : 'bg-ikz-cyan'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 bg-white/20 backdrop-blur-sm rounded-full">
            <Play size={20} fill="white" className="text-white" />
          </div>
        </div>
      </div>

      {/* Info panel on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
        <p className="text-white font-bold text-xs line-clamp-2 mb-1">{course.name}</p>
        {pct !== null && (
          <p className="text-[10px] text-ikz-cyan font-semibold">{pct}% concluído</p>
        )}
      </div>

      {/* Title always visible below */}
      <div className="bg-ikz-surface px-2 py-2">
        <p className="text-white text-xs font-semibold line-clamp-1">{course.name}</p>
        {pct !== null && pct > 0 && (
          <p className="text-[10px] text-gray-500 mt-0.5">{pct}% concluído</p>
        )}
      </div>
    </Link>
  )
}

export default function NetflixRow({ title, courses, orgslug, trailRuns }: NetflixRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!courses || courses.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  const getTrailRun = (course_uuid: string) =>
    trailRuns?.find((r: any) => r.course.course_uuid === course_uuid)

  return (
    <div className="mb-8 group/row">
      <h2 className="text-sm font-bold text-gray-200 mb-3 px-1">{title}</h2>
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course: any) => (
            <NetflixCard
              key={course.course_uuid}
              course={course}
              orgslug={orgslug}
              trailRun={getTrailRun(course.course_uuid)}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
