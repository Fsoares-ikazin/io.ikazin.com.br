'use client'

import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { blogTagColors, formatBlogDate, type BlogCardProps } from './blogCardShared'

export function BlogPostCard({ lang, post, copy, onClick }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug[lang]}`}
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-ikz-border bg-ikz-surface p-6 transition-all hover:-translate-y-0.5 hover:border-ikz-cyan/40"
    >
      <div className="mb-4 aspect-[1.91/1] overflow-hidden rounded-lg border border-ikz-border bg-ikz-bg">
        <img
          src={`/api/og/blog/${post.slug[lang]}`}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${blogTagColors[post.tag]}`}>
          {copy.tags[post.tag]}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <Clock size={10} /> {post.readMin} min
        </span>
      </div>
      <h3 className="mb-2 flex-1 text-base font-bold leading-snug text-white transition-colors group-hover:text-ikz-cyan">
        {post.title[lang]}
      </h3>
      <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-gray-500">{post.excerpt[lang]}</p>
      <div className="mt-auto flex items-center justify-between border-t border-ikz-border pt-3">
        <span className="text-[10px] text-gray-600">{formatBlogDate(post.date, lang)}</span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-ikz-cyan transition-all group-hover:gap-2">
          {copy.readMore} <ArrowRight size={10} />
        </span>
      </div>
    </Link>
  )
}
