'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Play, ChevronDown } from 'lucide-react'
import { track } from '@/lib/ikazin/analytics'
import { toast } from '@/lib/ikazin/toast'
import { copy } from '@/lib/ikazin/copy'
import { useNowPlaying } from '@/lib/ikazin/now-playing-context'
import { color, type BuildTier } from '@/lib/ikazin/tokens'

type BuildVideoPlayerProps = {
  buildId: string
  buildNumber?: number
  title?: string
  tier?: BuildTier
  thumbnailUrl?: string
  playbackUrl: string | null
  playbackStatus?: 'ready' | 'locked' | 'missing_assets' | 'storage_not_configured' | string | null
  playbackMessage?: string | null
  accessToken?: string
  onCompleted: () => void
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

const PROGRESS_INTERVAL_SECONDS = 10

export default function BuildVideoPlayer({
  buildId,
  buildNumber,
  title,
  tier = 'basic',
  thumbnailUrl,
  playbackUrl,
  playbackStatus,
  playbackMessage,
  accessToken,
  onCompleted,
}: BuildVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const lastPostedSecondRef = useRef(0)
  const startedRef = useRef(false)
  const milestonesRef = useRef<Set<number>>(new Set())
  const nowPlayingUpdateRef = useRef(0)

  const [speed, setSpeed] = useState<number>(1)
  const { setNowPlaying, update: updateNowPlaying } = useNowPlaying()

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return
    const video = videoRef.current

    // Register this build as NowPlaying immediately
    if (buildNumber) {
      setNowPlaying({
        buildId,
        buildNumber,
        title: title ?? `Build ${buildNumber}`,
        thumbnailUrl: thumbnailUrl ?? null,
        tier,
        currentTime: 0,
        duration: 0,
        isPlaying: false,
      })
    }

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

      const videoDuration =
        Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0

      if (videoDuration > 0) {
        const currentPercent = Math.round((second / videoDuration) * 100)
        for (const milestone of [25, 50, 75, 100]) {
          if (currentPercent >= milestone && !milestonesRef.current.has(milestone)) {
            milestonesRef.current.add(milestone)
            track('video_progress', { build_id: buildId, percent: milestone })
          }
        }
      }

      // Throttle NowPlaying updates to avoid React re-renders every frame
      const now = Date.now()
      if (now - nowPlayingUpdateRef.current > 2000) {
        nowPlayingUpdateRef.current = now
        updateNowPlaying({ currentTime: second, duration: videoDuration, isPlaying: !video.paused })
      }

      if (second - lastPostedSecondRef.current < PROGRESS_INTERVAL_SECONDS) return
      lastPostedSecondRef.current = second
      const percent = videoDuration > 0 ? second / videoDuration : 0
      void persistProgress(second, percent)
    }

    async function handleEnded() {
      updateNowPlaying({ isPlaying: false, currentTime: video.duration })
      try {
        await fetch(`/api/v1/ikazin/progress/${buildId}/complete`, {
          method: 'PUT',
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
      } catch {}
      track('video_completed', { build_id: buildId })
      onCompleted()
    }

    function handlePlay() {
      updateNowPlaying({ isPlaying: true })
      if (startedRef.current) return
      startedRef.current = true
      track('video_started', { build_id: buildId })
    }

    function handlePause() {
      updateNowPlaying({ isPlaying: false, currentTime: Math.floor(video.currentTime) })
    }

    function handleLoadedMetadata() {
      updateNowPlaying({ duration: video.duration })
      void applyResumePosition()
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playbackUrl
    } else if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(playbackUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          toast.error(copy.errors.videoLoadFailed)
        }
      })
    } else {
      video.src = playbackUrl
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      video.removeAttribute('src')
      video.load()
    }
  }, [accessToken, buildId, buildNumber, onCompleted, playbackUrl, setNowPlaying, thumbnailUrl, tier, title, updateNowPlaying])

  async function handleSpeedChange(nextSpeed: number) {
    setSpeed(nextSpeed)
    try {
      if (videoRef.current) {
        videoRef.current.playbackRate = nextSpeed
      }
    } catch {}
  }

  if (!playbackUrl) {
    const title =
      playbackStatus === 'storage_not_configured'
        ? 'Storage de video nao configurado'
        : 'Video em producao'
    const description =
      playbackMessage ??
      (playbackStatus === 'missing_assets'
        ? 'Publique os segmentos HLS para liberar o player.'
        : 'Disponivel em breve')

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[18px] border border-zinc-800 bg-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_32%),linear-gradient(145deg,_rgba(20,26,24,1),_rgba(24,24,27,1))]" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300">
            <Play className="ml-1 h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-zinc-100">{title}</p>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">{description}</p>
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

      {/* Watermark */}
      <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-bold tracking-[0.28em] text-white/30">
        IKAZIN
      </div>

      {/* Speed control */}
      <div className="absolute left-4 top-4 z-10">
        <div className="group relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-black/60 px-3 py-1.5 text-xs font-semibold text-zinc-100 backdrop-blur-sm transition-colors hover:border-zinc-600"
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
                className="block w-full px-3 py-2 text-left text-xs transition-colors"
                style={
                  speed === option
                    ? { background: color.primary.soft, color: color.primary.text }
                    : { color: '#d4d4d8' }
                }
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
