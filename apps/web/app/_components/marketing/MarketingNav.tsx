'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { LanguageToggle, type Lang } from './LanguageToggle'

interface NavCopy {
  plans: string
  audience: string
  blog: string
  login: string
  cta: string
}

interface MarketingNavProps {
  lang: Lang
  onLangChange: (l: Lang) => void
  copy: NavCopy
}

export function MarketingNav({ lang, onLangChange, copy }: MarketingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-ikz-border bg-ikz-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-64.png"
            alt="Ikazin.io Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
            priority
            style={{ filter: 'drop-shadow(0 0 6px hsl(var(--ikz-cyan) / 0.45))' }}
          />
          <span className="text-lg font-black tracking-tight text-ikz-cyan">
            Ikazin.io
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 text-sm font-medium text-gray-400 md:flex">
          <Link href="/planos" className="hover:text-white transition-colors">{copy.plans}</Link>
          <Link href="/#para-quem-e" className="hover:text-white transition-colors">{copy.audience}</Link>
          <Link href="/blog" className="hover:text-white transition-colors">{copy.blog}</Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <LanguageToggle lang={lang} onChange={onLangChange} />
          <Link
            href="/auth/login"
            className="hidden text-sm font-medium text-gray-400 transition-colors hover:text-white md:inline-flex"
          >
            {copy.login}
          </Link>
          <Link
            href="/planos"
            className="hidden items-center gap-1.5 rounded-lg bg-ikz-cyan px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:flex"
          >
            {copy.cta} <ChevronRight size={14} />
          </Link>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ikz-border bg-ikz-bg/95 px-6 py-4 space-y-4">
          <Link href="/planos" className="block text-gray-300 hover:text-white text-sm font-medium py-1" onClick={() => setMobileOpen(false)}>
            {copy.plans}
          </Link>
          <Link href="/#para-quem-e" className="block text-gray-300 hover:text-white text-sm font-medium py-1" onClick={() => setMobileOpen(false)}>
            {copy.audience}
          </Link>
          <Link href="/blog" className="block text-gray-300 hover:text-white text-sm font-medium py-1" onClick={() => setMobileOpen(false)}>
            {copy.blog}
          </Link>
          <Link
            href="/auth/login"
            className="block text-gray-300 hover:text-white text-sm font-medium py-1"
            onClick={() => setMobileOpen(false)}
          >
            {copy.login}
          </Link>
          <Link
            href="/planos"
            className="block w-full text-center rounded-lg bg-ikz-cyan px-4 py-2.5 text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            {copy.cta}
          </Link>
        </div>
      )}
    </nav>
  )
}
