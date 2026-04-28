'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Download, Play, BookOpen, MessageSquare, Lock, ArrowLeft, ExternalLink } from 'lucide-react'
import { useAuth } from '@components/Contexts/AuthContext'
import {
  getBuild,
  getDownloadUrl,
  type Build,
  TIER_LABELS,
  TIER_COLORS,
} from '@services/builds/builds'

export default function BuildDetailPage() {
  const { build_uuid } = useParams<{ build_uuid: string }>()
  const { status } = useAuth()
  const router = useRouter()
  const [build, setBuild] = useState<Build | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<'unity' | 'tia' | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/auth/login?next=/builds/${build_uuid}`)
    }
  }, [status, router, build_uuid])

  useEffect(() => {
    if (status !== 'authenticated') return
    getBuild(build_uuid).then((data) => {
      setBuild(data)
      setLoading(false)
    })
  }, [status, build_uuid])

  const handleDownload = async (type: 'unity' | 'tia') => {
    if (!build) return
    setDownloading(type)
    try {
      const result = await getDownloadUrl(build.build_uuid, type)
      if (result?.url) {
        window.open(result.url, '_blank')
      }
    } finally {
      setDownloading(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--ikz-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!build) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <p className="text-zinc-400">Build não encontrado.</p>
      </div>
    )
  }

  if (!build.has_access) {
    return <BuildLocked build={build} />
  }

  const colors = TIER_COLORS[build.tier]

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <header className="border-b border-white/8 px-6 py-4 flex items-center gap-4">
        <Link
          href="/builds"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft size={14} />
          Builds
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <span
            className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {TIER_LABELS[build.tier]}
          </span>
          <span className="text-zinc-500 text-xs font-mono">B{build.number}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">{build.title}</h1>
          {build.description && (
            <p className="text-zinc-400 text-base leading-relaxed">{build.description}</p>
          )}
        </div>

        {/* Video Demo */}
        {build.youtube_url && (
          <section className="space-y-4">
            <SectionHeader icon={<Play size={16} />} title="Demo" />
            <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/8">
              <iframe
                src={youtubeEmbedUrl(build.youtube_url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Downloads */}
        <section className="space-y-4">
          <SectionHeader icon={<Download size={16} />} title="Downloads" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DownloadCard
              title="Build Unity (.exe)"
              description="Simulação industrial — requer credenciais do assinante ativo"
              available={!!build.exe_key}
              loading={downloading === 'unity'}
              onClick={() => handleDownload('unity')}
            />
            <DownloadCard
              title="Template TIA Portal"
              description="Arquivo .ap18/.ap19 com senha fornecida na página"
              available={!!build.tia_key}
              loading={downloading === 'tia'}
              onClick={() => handleDownload('tia')}
            />
          </div>
        </section>

        {/* Tutorial */}
        {build.tutorial_md && (
          <section className="space-y-4">
            <SectionHeader icon={<BookOpen size={16} />} title="Tutorial" />
            <div className="prose prose-invert prose-sm max-w-none bg-white/3 border border-white/8 rounded-xl p-6">
              <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans">
                {build.tutorial_md}
              </pre>
            </div>
          </section>
        )}

        {/* Q&A placeholder */}
        <section className="space-y-4">
          <SectionHeader icon={<MessageSquare size={16} />} title="Dúvidas" />
          <div className="bg-white/3 border border-white/8 rounded-xl p-6 text-center text-zinc-500 text-sm">
            Campo de dúvidas em breve
          </div>
        </section>
      </main>
    </div>
  )
}

function BuildLocked({ build }: { build: Build }) {
  const colors = TIER_COLORS[build.tier]
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-6 px-6">
      <Lock size={40} className="text-zinc-600" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">{build.title}</h2>
        <p className="text-zinc-400 text-sm">
          Este build faz parte do plano{' '}
          <span className={`font-semibold ${colors.text}`}>{TIER_LABELS[build.tier]}</span>
        </p>
      </div>
      <Link
        href="/planos"
        className="px-5 py-2.5 rounded-lg bg-[var(--ikz-accent)] text-black font-semibold text-sm hover:brightness-110 transition-all"
      >
        Ver planos
      </Link>
      <Link href="/builds" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
        ← Voltar ao catálogo
      </Link>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-zinc-300">
      {icon}
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  )
}

function DownloadCard({
  title,
  description,
  available,
  loading,
  onClick,
}: {
  title: string
  description: string
  available: boolean
  loading: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!available || loading}
      className={`
        w-full text-left rounded-xl border p-5 transition-all duration-150 space-y-1.5
        ${available
          ? 'border-white/10 bg-white/4 hover:bg-white/8 hover:border-white/20 cursor-pointer'
          : 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{title}</span>
        {loading ? (
          <div className="w-4 h-4 border-2 border-[var(--ikz-accent)] border-t-transparent rounded-full animate-spin" />
        ) : available ? (
          <Download size={14} className="text-[var(--ikz-accent)]" />
        ) : (
          <span className="text-xs text-zinc-600">em breve</span>
        )}
      </div>
      <p className="text-xs text-zinc-500 leading-snug">{description}</p>
    </button>
  )
}

function youtubeEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    const id =
      u.searchParams.get('v') ||
      (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null)
    if (id) return `https://www.youtube.com/embed/${id}`
  } catch {}
  return url
}
