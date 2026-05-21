'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Play, ChevronDown } from 'lucide-react'
import { track } from '@/lib/ikazin/analytics'

type BuildVideoPlayerProps = {
  buildId: string
  playbackUrl: string | null
  accessToken?: string
  onCompleted: () => void
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

export default function BuildVideoPlayer({
  buildId,
  playbackUrl,
  accessToken,
  onCompleted,
}: BuildVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const lastPostedSecondRef = useRef(0)
  const startedRef = useRef(false)
  const milestonesRef = useRef<Set<number>>(new Set())
  const [speed, setSpeed] = useState<number>(1)

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return
    const video = videoRef.current

    async function applyResumePosition() {
      try {
        const response = await fetch(`/api/v1/ikazin/builds/${buildId}/resume`, {
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })

        if (!response.ok) return
        const resume = await response.json()
        const second = Number(resume.second ?? 0)
        if (second > 0) {
          video.currentTime = second
          lastPostedSecondRef.current = second
        }
      } catch {}
    }

    async function persistProgress(second: number, percent: number) {
      try {
        await fetch('/api/v1/ikazin/progress', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            build_id: buildId,
            second: Math.floor(second),
            percent: Math.round(percent * 100),
          }),
        })
      } catch {}
    }

    function handleTimeUpdate() {
      const second = Math.floor(video.currentTime ?? 0)
      if (second <= 0) return

      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0
      if (duration > 0) {
        const currentPercent = Math.round((second / duration) * 100)
        for (const milestone of [25, 50, 75, 100]) {
          if (currentPercent >= milestone && !milestonesRef.current.has(milestone)) {
            milestonesRef.current.add(milestone)
            track('video_progress', {
              build_id: buildId,
              percent: milestone,
            })
          }
        }
      }

      if (second - lastPostedSecondRef.current < 10) return

      lastPostedSecondRef.current = second
      const percent = duration > 0 ? second / duration : 0
      void persistProgress(second, percent)
    }

    async function handleEnded() {
      try {
        await fetch(`/api/v1/ikazin/progress/${buildId}/complete`, {
          method: 'PUT',
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
      } catch {}
      track('video_completed', {
        build_id: buildId,
      })
      onCompleted()
    }

    function handlePlay() {
      if (startedRef.current) return
      startedRef.current = true
      track('video_started', {
        build_id: buildId,
      })
    }

    function handleLoadedMetadata() {
      void applyResumePosition()
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playbackUrl
    } else if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(playbackUrl)
      hls.attachMedia(video)
    } else {
      video.src = playbackUrl
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      video.removeAttribute('src')
      video.load()
    }
  }, [accessToken, buildId, onCompleted, playbackUrl])

  async function handleSpeedChange(nextSpeed: number) {
    setSpeed(nextSpeed)
    try {
      if (videoRef.current) {
        videoRef.current.playbackRate = nextSpeed
      }
    } catch {}
  }

  if (!playbackUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[18px] border border-zinc-800 bg-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_32%),linear-gradient(145deg,_rgba(20,26,24,1),_rgba(24,24,27,1))]" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300">
            <Play className="ml-1 h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-zinc-100">Video em producao</p>
          <p className="mt-2 text-sm text-zinc-400">Disponivel em breve</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[18px] border border-zinc-800 bg-black shadow-2xl">
      <video
        ref={videoRef}
        controls
        playsInline
        className="h-full w-full bg-black object-contain"
      />

      <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-bold tracking-[0.28em] text-white/30">
        IKAZIN
      </div>

      <div className="absolute left-4 top-4 z-10">
        <div className="group relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-black/60 px-3 py-1.5 text-xs font-semibold text-zinc-100 backdrop-blur-sm"
          >
            {speed}x
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <div className="absolute left-0 top-full mt-2 hidden min-w-[88px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-xl group-hover:block">
            {PLAYBACK_SPEEDS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => void handleSpeedChange(option)}
                className={[
                  'block w-full px-3 py-2 text-left text-xs transition-colors',
                  speed === option
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100',
                ].join(' ')}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
