'use client'

import { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { color } from '@/lib/ikazin/tokens'

export type CodeBlockProps = {
  code: string
  language?: string
  title?: string
}

export function CodeBlock({ code, language = 'plaintext', title }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    async function highlight() {
      try {
        // Dynamic import keeps shiki out of the initial bundle (~200KB gzip)
        const { codeToHtml } = await import('shiki/bundle/web')
        const highlighted = await codeToHtml(code, {
          lang: language as Parameters<typeof codeToHtml>[1]['lang'],
          theme: 'github-dark',
        })
        if (alive) setHtml(highlighted)
      } catch {
        if (alive) setHtml('')
      }
    }
    void highlight()
    return () => {
      alive = false
    }
  }, [code, language])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div
      className="my-6 overflow-hidden rounded-xl border"
      style={{ borderColor: color.border.DEFAULT }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: color.surfaceRaised,
          borderBottom: `1px solid ${color.border.DEFAULT}`,
        }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: color.text.dim }}
        >
          {title ?? language}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] transition-colors hover:bg-zinc-700"
          style={{ color: color.text.muted }}
          aria-label="Copiar código"
        >
          {copied ? (
            <Check className="h-3 w-3" style={{ color: color.success }} />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>

      {/* Syntax-highlighted output or plain fallback */}
      {html ? (
        <div
          className="[&_pre]:overflow-x-auto [&_pre]:p-5 [&_pre]:text-sm [&_pre]:leading-relaxed"
          style={{ background: color.surfaceSunken }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className="overflow-x-auto p-5 text-sm leading-relaxed"
          style={{
            background: color.surfaceSunken,
            color: color.text.secondary,
            fontFamily: 'var(--font-ikazin-mono, "JetBrains Mono", monospace)',
          }}
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
