import type { BlogPost } from '@/app/_data/blog-posts'
import type { Lang } from '@/app/_components/marketing/LanguageToggle'

export const blogTagColors: Record<string, string> = {
  vc: 'bg-ikz-cyan/10 text-ikz-cyan',
  plc: 'bg-ikz-lime/10 text-ikz-lime',
  drives: 'bg-[rgba(168,85,247,0.12)] text-purple-400',
  dt: 'bg-[rgba(251,146,60,0.12)] text-orange-400',
}

export function formatBlogDate(dateStr: string, lang: Lang) {
  return new Date(dateStr).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export interface BlogCardCopy {
  readMore: string
  tags: Record<string, string>
}

export interface BlogCardProps {
  lang: Lang
  post: BlogPost
  copy: BlogCardCopy
  onClick?: () => void
}
