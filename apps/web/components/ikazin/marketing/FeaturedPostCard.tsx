'use client'

import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { blogTagColors, formatBlogDate, type BlogCardProps } from './blogCardShared'

export function FeaturedPostCard({ lang, post, copy, onClick }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug[lang]}`}
      onClick={onClick}
      className="group block rounded-2xl border border-ikz-lime/40 bg-ikz-surface p-8 hover:border-ikz-lime hover:shadow-glow-lime transition-all"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-10">
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${blogTagColors[post.tag]}`}>
              {copy.tags[post.tag]}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={11} /> {post.readMin} min
            </span>
            <span className="text-xs text-gray-500">{formatBlogDate(post.date, lang)}</span>
          </div>
          <h2 className="mb-3 text-2xl font-black leading-tight text-white transition-colors group-hover:text-ikz-cyan">
            {post.title[lang]}
          </h2>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-400">{post.excerpt[lang]}</p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-ikz-cyan transition-all group-hover:gap-3">
            {copy.readMore} <ArrowRight size={14} />
          </span>
        </div>
        <div className="hidden h-40 w-64 shrink-0 overflow-hidden rounded-xl border border-ikz-border bg-ikz-bg md:block">
          <img
            src={`/api/og/blog/${post.slug[lang]}`}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </Link>
  )
}
