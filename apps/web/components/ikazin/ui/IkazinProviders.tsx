'use client'

import { Toaster } from 'sonner'
import { color } from '@/lib/ikazin/tokens'

/**
 * Providers visuais Ikazin — montar dentro do layout (ikazin).
 * Hoje: Toaster (sonner). No futuro: NowPlayingContext, CmdK wrapper, etc.
 */
export default function IkazinProviders() {
  return (
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
  )
}
