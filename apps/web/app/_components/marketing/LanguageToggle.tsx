'use client'

import { useEffect, useState } from 'react'

export type Lang = 'en' | 'pt'

const STORAGE_KEY = 'ikazin-marketing-lang'

export function useMarketingLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === 'en' || stored === 'pt') {
      setLangState(stored)
    } else {
      // detect browser language
      const browser = navigator.language.toLowerCase()
      setLangState(browser.startsWith('pt') ? 'pt' : 'en')
    }
  }, [])

  function setLang(l: Lang) {
    localStorage.setItem(STORAGE_KEY, l)
    setLangState(l)
  }

  return [lang, setLang]
}

interface Props {
  lang: Lang
  onChange: (l: Lang) => void
}

export function LanguageToggle({ lang, onChange }: Props) {
  return (
    <div className="flex items-center rounded-lg border border-ikz-border bg-ikz-surface p-0.5 text-xs font-semibold">
      <button
        onClick={() => onChange('en')}
        className={`rounded-md px-2.5 py-1 transition-colors ${
          lang === 'en'
            ? 'bg-ikz-lime text-ikz-bg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange('pt')}
        className={`rounded-md px-2.5 py-1 transition-colors ${
          lang === 'pt'
            ? 'bg-ikz-lime text-ikz-bg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        PT
      </button>
    </div>
  )
}
