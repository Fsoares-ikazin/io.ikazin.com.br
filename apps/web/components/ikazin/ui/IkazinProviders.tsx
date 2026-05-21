'use client'

import { useState, type ReactNode } from 'react'
import { Toaster } from 'sonner'
import { color } from '@/lib/ikazin/tokens'
import { NowPlayingProvider } from '@/lib/ikazin/now-playing-context'
import MiniPlayer from './MiniPlayer'
import IkazinSearch, { useCmdK } from './IkazinSearch'

function IkazinGlobalUI({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  useCmdK(setSearchOpen)

  return (
    <>
      {children}
      <MiniPlayer />
      <IkazinSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: color.surface,
            border: `1px solid ${color.border.DEFAULT}`,
            color: color.text.primary,
            fontFamily: 'var(--font-ikazin), system-ui, sans-serif',
          },
          className: 'ikz-toast',
        }}
      />
    </>
  )
}

export default function IkazinProviders({ children }: { children: ReactNode }) {
  return (
    <NowPlayingProvider>
      <IkazinGlobalUI>{children}</IkazinGlobalUI>
    </NowPlayingProvider>
  )
}
