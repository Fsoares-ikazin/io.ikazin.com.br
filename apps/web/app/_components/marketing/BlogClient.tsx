'use client'

import Link from 'next/link'
import { Clock, ArrowRight, BookOpen, Rss } from 'lucide-react'
import { useMarketingLang, type Lang } from './LanguageToggle'
import { MarketingNav } from './MarketingNav'
import { posts as allPosts } from '../../_data/blog-posts'

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    nav: { plans: 'Plans', blog: 'Blog', cta: 'Access Platform' },
    title: 'Technical Blog',
    sub: 'Deep-dives on Virtual Commissioning, Digital Twin and industrial automation.',
    featured: 'Featured',
    readMore: 'Read article',
    allPosts: 'All articles',
    tags: { all: 'All', vc: 'Virtual Commissioning', dt: 'Digital Twin', plc: 'PLC / TIA Portal', drives: 'Drives & Motion' },
    newsletter: { title: 'Get new articles in your inbox', sub: 'No spam. Only technical content about industrial automation.', cta: 'Subscribe', placeholder: 'your@email.com' },
    footerCopy: 'All rights reserved.',
  },
  pt: {
    nav: { plans: 'Planos', blog: 'Blog', cta: 'Acessar Plataforma' },
    title: 'Blog Técnico',
    sub: 'Conteúdo profundo sobre Comissionamento Virtual, Gêmeo Digital e automação industrial.',
    featured: 'Destaque',
    readMore: 'Ler artigo',
    allPosts: 'Todos os artigos',
    tags: { all: 'Todos', vc: 'Comissionamento Virtual', dt: 'Gêmeo Digital', plc: 'PLC / TIA Portal', drives: 'Drives & Motion' },
    newsletter: { title: 'Receba novos artigos no seu e-mail', sub: 'Sem spam. Só conteúdo técnico sobre automação industrial.', cta: 'Assinar', placeholder: 'seu@email.com' },
    footerCopy: 'Todos os direitos reservados.',
  },
}

const tagColors: Record<string, string> = {
  vc: 'bg-[rgba(53,135,164,0.12)] text-[#3587A4]',
  plc: 'bg-[rgba(132,204,22,0.12)] text-lime-400',
  drives: 'bg-[rgba(168,85,247,0.12)] text-purple-400',
  dt: 'bg-[rgba(251,146,60,0.12)] text-orange-400',
}

function formatDate(dateStr: string, lang: Lang) {
  return new Date(dateStr).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function BlogClient() {
  const [lang, setLang] = useMarketingLang()
  const t = copy[lang]
  const featured = allPosts.find(p => p.featured)!
  const rest = allPosts.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-[#0F1419] text-gray-100">
      <MarketingNav lang={lang} onLangChange={setLang} copy={t.nav} />

      {/* Hero */}
      <section className="px-6 py-16 text-center border-b border-[#2D2D2D]">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(53,135,164,0.25)] bg-[rgba(53,135,164,0.07)] px-4 py-1.5 text-xs font-semibold text-[#3587A4]">
            <Rss size={12} /> {t.title}
          </div>
          <h1 className="mb-3 text-4xl font-black tracking-tight text-white md:text-5xl">{t.title}</h1>
          <p className="text-gray-400 max-w-xl mx-auto">{t.sub}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Featured post */}
        <div className="mb-12">
          <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-[#3587A4]">{t.featured}</span>
          <Link href={`/blog/${featured.slug[lang]}`} className="group block rounded-2xl border border-[#2D2D2D] bg-[#1F1F1F] p-8 hover:border-[rgba(53,135,164,0.3)] transition-colors">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${tagColors[featured.tag]}`}>
                    {t.tags[featured.tag as keyof typeof t.tags]}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Clock size={11} /> {featured.readMin} min
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(featured.date, lang)}</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-3 group-hover:text-[#3587A4] transition-colors leading-tight">
                  {featured.title[lang]}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-2xl">{featured.excerpt[lang]}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#3587A4] group-hover:gap-3 transition-all">
                  {t.readMore} <ArrowRight size={14} />
                </span>
              </div>
              {/* Decorative graphic */}
              <div className="hidden md:flex h-40 w-64 shrink-0 items-center justify-center rounded-xl bg-[#0F1419] border border-[#2D2D2D]">
                <BookOpen size={48} className="text-[#2D2D2D]" />
              </div>
            </div>
          </Link>
        </div>

        {/* Post grid */}
        <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-500">{t.allPosts}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map(post => (
            <Link
              key={post.slug.en}
              href={`/blog/${post.slug[lang]}`}
              className="group flex flex-col rounded-xl border border-[#2D2D2D] bg-[#1F1F1F] p-6 hover:border-[rgba(53,135,164,0.25)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${tagColors[post.tag]}`}>
                  {t.tags[post.tag as keyof typeof t.tags]}
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Clock size={10} /> {post.readMin} min
                </span>
              </div>
              <h3 className="font-bold text-white text-base leading-snug mb-2 group-hover:text-[#3587A4] transition-colors flex-1">
                {post.title[lang]}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">{post.excerpt[lang]}</p>
              <div className="flex items-center justify-between border-t border-[#2D2D2D] pt-3 mt-auto">
                <span className="text-[10px] text-gray-600">{formatDate(post.date, lang)}</span>
                <span className="text-[10px] font-bold text-[#3587A4] flex items-center gap-1 group-hover:gap-2 transition-all">
                  {t.readMore} <ArrowRight size={10} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <section className="mt-16 rounded-2xl border border-[#2D2D2D] bg-[#1F1F1F] p-10 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[rgba(53,135,164,0.1)]">
              <Rss size={20} className="text-[#3587A4]" />
            </div>
            <h2 className="mb-2 text-2xl font-black text-white">{t.newsletter.title}</h2>
            <p className="mb-6 text-sm text-gray-400">{t.newsletter.sub}</p>
            <form className="flex gap-2 max-w-sm mx-auto" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder={t.newsletter.placeholder}
                className="flex-1 rounded-lg border border-[#2D2D2D] bg-[#0F1419] px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-[#3587A4] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#3587A4] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {t.newsletter.cta}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2D2D2D] px-6 py-8 mt-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-600 md:flex-row">
          <span>© {new Date().getFullYear()} Ikazin®. {t.footerCopy}</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
