'use client'

import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, ChevronRight } from 'lucide-react'
import { useMarketingLang } from './LanguageToggle'
import { MarketingNav } from './MarketingNav'
import type { BlogPost, ContentBlock, Lang } from '../../_data/blog-posts'
import { posts } from '../../_data/blog-posts'
import { trackPublicMarketingEvent } from './PublicMarketingTracker'
import BlogBuildCTA from './BlogBuildCTA'
import { CodeBlock } from '@components/ikazin/ui/CodeBlock'

// ─── Copy ──────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    nav: { plans: 'Plans', audience: 'Who it’s for', blog: 'Blog', login: 'Sign in', cta: 'Start now' },
    back: 'Back to blog',
    readMin: 'min read',
    related: 'Related articles',
    readMore: 'Read article',
    cta: {
      title: 'Learn by doing — not just reading',
      sub: 'Each IKAZIN.IO build takes you from theory to a working simulation in TIA Portal + RealVirtual. No hardware required.',
      btn: 'See plans',
    },
    tags: { all: 'All', vc: 'Virtual Commissioning', dt: 'Digital Twin', plc: 'PLC / TIA Portal', drives: 'Drives & Motion' },
    notFound: 'Article not found.',
    footerCopy: 'All rights reserved.',
  },
  pt: {
    nav: { plans: 'Planos', audience: 'Para quem é', blog: 'Blog', login: 'Entrar', cta: 'Começar agora' },
    back: 'Voltar ao blog',
    readMin: 'min de leitura',
    related: 'Artigos relacionados',
    readMore: 'Ler artigo',
    cta: {
      title: 'Aprenda fazendo — não só lendo',
      sub: 'Cada build do IKAZIN.IO leva você da teoria para uma simulação funcional no TIA Portal + RealVirtual. Sem hardware.',
      btn: 'Ver planos',
    },
    tags: { all: 'Todos', vc: 'Comissionamento Virtual', dt: 'Gêmeo Digital', plc: 'PLC / TIA Portal', drives: 'Drives & Motion' },
    notFound: 'Artigo não encontrado.',
    footerCopy: 'Todos os direitos reservados.',
  },
}

const tagColors: Record<string, string> = {
  vc: 'bg-ikz-cyan/10 text-ikz-cyan',
  plc: 'bg-ikz-lime/10 text-ikz-lime',
  drives: 'bg-[rgba(168,85,247,0.12)] text-purple-400',
  dt: 'bg-[rgba(251,146,60,0.12)] text-orange-400',
}

const buildMap: Record<string, { buildNumber: number; title: string; tier: 'basic' | 'essentials' | 'advanced' | 'premium'; duration: string }> = {
  'sinamics-s120-speed-position': { buildNumber: 14, title: 'SINAMICS S120 - velocidade e posicao', tier: 'advanced', duration: '42 min' },
  'sinamics-s120-velocidade-posicao': { buildNumber: 14, title: 'SINAMICS S120 - velocidade e posicao', tier: 'advanced', duration: '42 min' },
  'tia-portal-digital-twin-realvirtual': { buildNumber: 14, title: 'TIA Portal + gemeo digital RealVirtual', tier: 'advanced', duration: '42 min' },
  'tia-portal-gemeo-digital-realvirtual': { buildNumber: 14, title: 'TIA Portal + gemeo digital RealVirtual', tier: 'advanced', duration: '42 min' },
  'plc-state-machine': { buildNumber: 2, title: 'Maquina de estados para CLP', tier: 'basic', duration: '28 min' },
  'clp-maquina-de-estados': { buildNumber: 2, title: 'Maquina de estados para CLP', tier: 'basic', duration: '28 min' },
  'rotary-knife-electronic-gearing': { buildNumber: 16, title: 'Faca rotativa com acoplamento eletronico', tier: 'advanced', duration: '47 min' },
  'faca-rotativa-acoplamento-eletronico': { buildNumber: 16, title: 'Faca rotativa com acoplamento eletronico', tier: 'advanced', duration: '47 min' },
}

const fallbackBuild = {
  buildNumber: 1,
  title: 'Fundamentos PLC com simulacao',
  tier: 'basic' as const,
  duration: '24 min',
}

function formatDate(dateStr: string, lang: Lang) {
  return new Date(dateStr).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ─── Content block renderer ────────────────────────────────────────────────────

function renderBlock(block: ContentBlock, idx: number) {
  switch (block.type) {
    case 'p':
      return (
        <p key={idx} className="text-gray-300 leading-relaxed text-base mb-5">
          {block.text}
        </p>
      )
    case 'h2':
      return (
        <h2 key={idx} className="text-2xl font-black text-white mt-10 mb-4 leading-tight">
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={idx} className="text-lg font-bold text-white mt-8 mb-3 leading-snug">
          {block.text}
        </h3>
      )
    case 'code':
      return (
        <CodeBlock key={idx} code={block.code} language={block.lang} />
      )
    case 'ul':
      return (
        <ul key={idx} className="mb-5 space-y-2 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300 text-base leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ikz-cyan" />
              {item}
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={idx} className="mb-5 space-y-2 pl-1 list-none">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300 text-base leading-relaxed">
              <span className="shrink-0 min-w-[1.5rem] text-center font-bold text-ikz-cyan text-sm mt-0.5">
                {i + 1}.
              </span>
              {item}
            </li>
          ))}
        </ol>
      )
    case 'callout': {
      const variants = {
        tip: { border: 'border-ikz-cyan', bg: 'bg-ikz-cyan/10', label: '💡 Tip', labelColor: 'text-ikz-cyan' },
        warning: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/5', label: '⚠️ Warning', labelColor: 'text-yellow-400' },
        info: { border: 'border-blue-500/40', bg: 'bg-blue-500/5', label: 'ℹ️ Note', labelColor: 'text-blue-400' },
      }
      const v = variants[block.variant]
      return (
        <div key={idx} className={`my-6 rounded-xl border-l-4 ${v.border} ${v.bg} px-5 py-4`}>
          <span className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${v.labelColor}`}>{v.label}</span>
          <p className="text-gray-300 text-sm leading-relaxed">{block.text}</p>
        </div>
      )
    }
    case 'separator':
      return <hr key={idx} className="my-10 border-ikz-border" />
    default:
      return null
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  slug: string
}

export function BlogPostClient({ slug }: Props) {
  const [lang, setLang] = useMarketingLang()
  const t = copy[lang]

  const post = posts.find(p => p.slug.en === slug || p.slug.pt === slug)

  const relatedPosts = post
    ? posts
        .filter(p => p !== post && p.tag === post.tag)
        .slice(0, 3)
    : []

  return (
    <div className="min-h-screen bg-ikz-bg text-gray-100">
      <MarketingNav lang={lang} onLangChange={setLang} copy={t.nav} />

      {!post ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-500">{t.notFound}</p>
        </div>
      ) : (
        <>
          {(() => {
            const buildInfo = buildMap[slug] || buildMap[post.slug.pt] || buildMap[post.slug.en] || fallbackBuild
            let paragraphCount = 0
            let inlineCtaInserted = false
            const articleBlocks = post.content[lang].flatMap((block, i) => {
              const rendered = renderBlock(block, i)
              if (block.type === 'p') {
                paragraphCount += 1
              }
              if (paragraphCount === 3 && !inlineCtaInserted) {
                inlineCtaInserted = true
                return [
                  rendered,
                  (
                    <BlogBuildCTA
                      key={`inline-cta-${slug}`}
                      slug={post.slug[lang]}
                      buildNumber={buildInfo.buildNumber}
                      title={buildInfo.title}
                      tier={buildInfo.tier}
                      duration={buildInfo.duration}
                    />
                  ),
                ]
              }
              return [rendered]
            })

            return (
              <>
          {/* Article header */}
          <header className="border-b border-ikz-border px-6 py-12">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-ikz-cyan transition-colors"
              >
                <ArrowLeft size={13} /> {t.back}
              </Link>

              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${tagColors[post.tag]}`}>
                  {t.tags[post.tag as keyof typeof t.tags]}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={11} /> {post.readMin} {t.readMin}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={11} /> {formatDate(post.date, lang)}
                </span>
              </div>

              <h1 className="text-3xl font-black leading-tight text-white md:text-4xl mb-4">
                {post.title[lang]}
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                {post.excerpt[lang]}
              </p>
            </div>
          </header>

          <section className="mx-auto max-w-3xl px-6 pt-8">
            <div className="overflow-hidden rounded-2xl border border-ikz-border bg-ikz-surface">
              <img
                src={`/api/og/blog/${post.slug[lang]}`}
                alt=""
                className="aspect-[1.91/1] w-full object-cover"
              />
            </div>
          </section>

          {/* Article body */}
          <main className="mx-auto max-w-3xl px-6 py-12">
            {articleBlocks}
          </main>

          {/* Mid-article CTA */}
          <section className="mx-auto max-w-3xl px-6 mb-12">
            <BlogBuildCTA
              slug={post.slug[lang]}
              buildNumber={buildInfo.buildNumber}
              title={buildInfo.title}
              tier={buildInfo.tier}
              duration={buildInfo.duration}
              variant="footer"
            />
          </section>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <section className="border-t border-ikz-border px-6 py-12">
              <div className="mx-auto max-w-3xl">
                <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-500">{t.related}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map(p => (
                    <Link
                      key={p.slug.en}
                      href={`/blog/${p.slug[lang]}`}
                      onClick={() => trackPublicMarketingEvent('blog_related_click', { from: post.slug[lang], to: p.slug[lang] })}
                      className="group flex flex-col rounded-xl border border-ikz-border bg-ikz-surface p-5 hover:border-ikz-cyan/40 transition-all hover:-translate-y-0.5"
                    >
                      <span className={`mb-3 self-start text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${tagColors[p.tag]}`}>
                        {t.tags[p.tag as keyof typeof t.tags]}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug mb-3 group-hover:text-ikz-cyan transition-colors flex-1">
                        {p.title[lang]}
                      </h3>
                      <span className="text-[10px] font-bold text-ikz-cyan flex items-center gap-1 group-hover:gap-2 transition-all">
                        {t.readMore} <ChevronRight size={10} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
              </>
            )
          })()}
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-ikz-border px-6 py-8 mt-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-600 md:flex-row">
          <span>© {new Date().getFullYear()} Ikazin.io. {t.footerCopy}</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
