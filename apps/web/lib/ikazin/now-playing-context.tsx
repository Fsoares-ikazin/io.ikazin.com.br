'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { BuildTier } from '@/lib/ikazin/tokens'

export interface NowPlayingState {
  buildId: string
  buildNumber: number
  title: string
  thumbnailUrl: string | null
  tier: BuildTier
  currentTime: number
  duration: number
  isPlaying: boolean
}

interface NowPlayingCtx {
  nowPlaying: NowPlayingState | null
  setNowPlaying: (state: NowPlayingState | null) => void
  update: (patch: Partial<NowPlayingState>) => void
  clear: () => void
}

const NowPlayingContext = createContext<NowPlayingCtx | null>(null)

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [nowPlaying, setNowPlayingState] = useState<NowPlayingState | null>(null)

  const setNowPlaying = useCallback((state: NowPlayingState | null) => {
    setNowPlayingState(state)
  }, [])

  const update = useCallback((patch: Partial<NowPlayingState>) => {
    setNowPlayingState((current) => (current ? { ...current, ...patch } : current))
  }, [])

  const clear = useCallback(() => setNowPlayingState(null), [])

  return (
    <NowPlayingContext.Provider value={{ nowPlaying, setNowPlaying, update, clear }}>
      {children}
    </NowPlayingContext.Provider>
  )
}

export function useNowPlaying(): NowPlayingCtx {
  const ctx = useContext(NowPlayingContext)
  // Return no-ops when used outside provider (safe fallback)
  return ctx ?? {
    nowPlaying: null,
    setNowPlaying: () => {},
    update: () => {},
    clear: () => {},
  }
}
