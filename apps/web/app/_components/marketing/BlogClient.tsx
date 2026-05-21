'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { Rss } from 'lucide-react'
import { useMarketingLang } from './LanguageToggle'
import { MarketingNav } from './MarketingNav'
import { posts as allPosts } from '../../_data/blog-posts'
import { trackPublicMarketingEvent } from './PublicMarketingTracker'
import { FeaturedPostCard } from '@/components/ikazin/marketing/FeaturedPostCard'
import { BlogPostCard } from '@/components/ikazin/marketing/BlogPostCard'

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    nav: { plans: 'Plans', audience: 'Who it’s for', blog: 'Blog', login: 'Sign in', cta: 'Start now' },
    title: 'Technical Blog',
    sub: 'Deep-dives on Virtual Commissioning, Digital Twin and industrial automation.',
    featured: 'Featured',
    readMore: 'Read article',
    allPosts: 'All articles',
    tags: { all: 'All', vc: 'Virtual Commissioning', dt: 'Digital Twin', plc: 'PLC / TIA Portal', drives: 'Drives & Motion' },
    newsletter: { title: 'Get the Build 14 guide for free', sub: 'We will send the SINAMICS S120 placeholder guide to your inbox.', cta: 'Receive guide', placeholder: 'your@email.com' },
    newsletterSuccess: 'Guide sent. Check your inbox.',
    newsletterError: 'Could not send the guide right now.',
    footerCopy: 'All rights reserved.',
  },
  pt: {
    nav: { plans: 'Planos', audience: 'Para quem é', blog: 'Blog', login: 'Entrar', cta: 'Começar agora' },
    title: 'Blog Técnico',
    sub: 'Conteúdo profundo sobre Comissionamento Virtual, Gêmeo Digital e automação industrial.',
    featured: 'Destaque',
    readMore: 'Ler artigo',
    allPosts: 'Todos os artigos',
    tags: { all: 'Todos', vc: 'Comissionamento Virtual', dt: 'Gêmeo Digital', plc: 'PLC / TIA Portal', drives: 'Drives & Motion' },
    newsletter: { title: 'Receba o guia do Build 14 gratuitamente', sub: 'Vamos enviar o placeholder do guia SINAMICS S120 para o seu email.', cta: 'Receber guia', placeholder: 'seu@email.com' },
    newsletterSuccess: 'Guia enviado. Confira sua caixa de entrada.',
    newsletterError: 'Nao foi possivel enviar o guia agora.',
    footerCopy: 'Todos os direitos reservados.',
  },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function BlogClient() {
  const [lang, setLang] = useMarketingLang()
  const [email, setEmail] = useState('')
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const t = copy[lang]
  const featured = allPosts.find(p => p.featured)!
  const rest = allPosts.filter(p => !p.featured)

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNewsletterState('loading')

    try {
      const response = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          lang,
          source: 'blog_index_lead_magnet',
          path: typeof window !== 'undefined' ? window.location.pathname : '/blog',
          build_number: 14,
          title: 'SINAMICS S120',
        }),
      })

      if (!response.ok) throw new Error('Lead magnet delivery failed')

      trackPublicMarketingEvent('lead_magnet_submit', {
        source: 'blog_index',
        lang,
        build_number: 14,
      })
      setNewsletterState('success')
      setEmail('')
    } catch {
      setNewsletterState('error')
    }
  }

  return (
    <div className="min-h-screen bg-ikz-bg text-gray-100">
      <MarketingNav lang={lang} onLangChange={setLang} copy={t.nav} />

      {/* Hero */}
      <section className="px-6 py-16 text-center border-b border-ikz-border">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ikz-cyan/25 bg-ikz-cyan/10 px-4 py-1.5 text-xs font-semibold text-ikz-cyan">
            <Rss size={12} /> {t.title}
          </div>
          <h1 className="mb-3 text-4xl font-black tracking-tight text-white md:text-5xl">{t.title}</h1>
          <p className="text-gray-400 max-w-xl mx-auto">{t.sub}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Featured post */}
        <div className="mb-12">
          <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-ikz-cyan">{t.featured}</span>
          <FeaturedPostCard
            lang={lang}
            post={featured}
            copy={{ readMore: t.readMore, tags: t.tags }}
            onClick={() => trackPublicMarketingEvent('blog_card_click', { slug: featured.slug[lang], featured: true })}
          />
        </div>

        {/* Post grid */}
        <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-500">{t.allPosts}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map(post => (
            <BlogPostCard
              key={post.slug.en}
              lang={lang}
              post={post}
              copy={{ readMore: t.readMore, tags: t.tags }}
              onClick={() => trackPublicMarketingEvent('blog_card_click', { slug: post.slug[lang], featured: false })}
            />
          ))}
        </div>

        {/* Newsletter CTA */}
        <section className="mt-16 rounded-2xl border border-ikz-border bg-ikz-surface p-10 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-ikz-cyan/10">
              <Rss size={20} className="text-ikz-cyan" />
            </div>
            <h2 className="mb-2 text-2xl font-black text-white">{t.newsletter.title}</h2>
            <p className="mb-6 text-sm text-gray-400">{t.newsletter.sub}</p>
            <form className="mx-auto flex max-w-sm flex-col gap-2 sm:flex-row" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.newsletter.placeholder}
                required
                className="min-w-0 flex-1 rounded-lg border border-ikz-border bg-ikz-bg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-ikz-cyan focus:outline-none"
              />
              <button
                type="submit"
                disabled={newsletterState === 'loading'}
                className="btn-primary w-full shrink-0 sm:w-auto"
              >
                {newsletterState === 'loading' ? '...' : t.newsletter.cta}
              </button>
            </form>
            {newsletterState === 'success' && (
              <p className="mt-3 text-xs text-ikz-lime">{t.newsletterSuccess}</p>
            )}
            {newsletterState === 'error' && (
              <p className="mt-3 text-xs text-red-300">{t.newsletterError}</p>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-ikz-border px-6 py-8 mt-8">
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
