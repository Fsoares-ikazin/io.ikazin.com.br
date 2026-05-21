import type { ReactNode } from 'react'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import IkazinAnalyticsProvider from '@components/ikazin/ui/IkazinAnalyticsProvider'
import IkazinProviders from '@components/ikazin/ui/IkazinProviders'
import { color } from '@/lib/ikazin/tokens'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ikazin',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ikazin-mono',
})

export default function IkazinLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      style={{
        minHeight: '100vh',
        backgroundColor: color.bg,
        color: color.text.primary,
        fontFamily: 'var(--font-ikazin), var(--font-default), sans-serif',
      }}
    >
      <IkazinAnalyticsProvider />
      <IkazinProviders />
      {children}
    </div>
  )
}
