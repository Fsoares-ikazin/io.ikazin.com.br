'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Maximize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useNowPlaying } from '@/lib/ikazin/now-playing-context'
import IkazinBadge from './IkazinBadge'
import { fadeUp } from '@/lib/ikazin/motion'
import { color } from '@/lib/ikazin/tokens'
import { getUriWithOrg } from '@services/config/config'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MiniPlayer() {
  const { nowPlaying, clear } = useNowPlaying()
  const params = useParams<{ orgslug: string }>()
  const pathname = usePathname()
  const orgslug = params?.orgslug ?? ''

  const isOnBuildPage = Boolean(
    nowPlaying &&
      (pathname.includes(`/build/${nowPlaying.buildId}`) ||
        pathname.includes(`/build/${nowPlaying.buildNumber}`))
  )
  const visible = Boolean(nowPlaying && !isOnBuildPage)

  const pct =
    nowPlaying && nowPlaying.duration > 0
      ? Math.round((nowPlaying.currentTime / nowPlaying.duration) * 100)
      : 0

  return (
    <AnimatePresence>
      {visible && nowPlaying && (
        <motion.div
          key="mini-player"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="hidden"
          aria-label="Mini player"
          className={[
            'fixed z-50 overflow-hidden border bg-[#141a18] shadow-2xl',
            // Mobile: full-width bottom bar
            'bottom-0 left-0 right-0 rounded-t-2xl border-t border-l border-r border-b-0',
            // Desktop: card bottom-right
            'md:bottom-4 md:right-4 md:left-auto md:w-80 md:rounded-2xl md:border',
          ].join(' ')}
          style={{ borderColor: color.border.DEFAULT }}
        >
          {/* Progress bar */}
          <div className="h-0.5 w-full" style={{ background: color.border.subtle }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${pct}%`, background: color.primary.DEFAULT }}
            />
          </div>

          <div className="p-3">
            <div className="flex items-center gap-3">
              {/* Thumbnail */}
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                {nowPlaying.thumbnailUrl ? (
                  <img
                    src={nowPlaying.thumbnailUrl}
                    alt={nowPlaying.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs font-black text-zinc-700">
                      #{nowPlaying.buildNumber}
                    </span>
                  </div>
                )}
                {nowPlaying.isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div
                      className="h-1.5 w-1.5 animate-ping rounded-full"
                      style={{ background: color.primary.DEFAULT }}
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-zinc-100">
                  {nowPlaying.title}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <IkazinBadge variant="tier" tier={nowPlaying.tier} size="sm" />
                  {nowPlaying.duration > 0 && (
                    <span className="text-[10px]" style={{ color: color.text.dim }}>
                      {formatTime(nowPlaying.currentTime)} / {formatTime(nowPlaying.duration)}
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex shrink-0 items-center gap-0.5">
                <Link
                  href={getUriWithOrg(orgslug, `/build/${nowPlaying.buildNumber}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800"
                  style={{ color: color.text.muted }}
                  aria-label="Abrir build"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800"
                  style={{ color: color.text.muted }}
                  aria-label="Fechar mini player"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
