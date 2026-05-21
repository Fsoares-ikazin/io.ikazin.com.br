import type { ReactNode } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import IkazinAnalyticsProvider from '@components/ikazin/ui/IkazinAnalyticsProvider'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ikazin',
})

export default function IkazinLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={plusJakartaSans.variable}
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0e0d',
        color: '#f4f4f5',
        fontFamily: 'var(--font-ikazin), var(--font-default), sans-serif',
      }}
    >
      <IkazinAnalyticsProvider />
      {children}
    </div>
  )
}
