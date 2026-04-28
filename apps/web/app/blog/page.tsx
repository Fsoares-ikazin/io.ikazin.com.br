import { BlogClient } from '../_components/marketing/BlogClient'

const siteUrl = (
  process.env.NEXT_PUBLIC_LEARNHOUSE_PLATFORM_URL ||
  process.env.NEXT_PUBLIC_LEARNHOUSE_BACKEND_URL ||
  'https://io.ikazin.com.br'
).replace(/\/+$/, '')

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Blog Técnico | Ikazin.io — Virtual Commissioning & Digital Twin',
  description: 'Artigos técnicos sobre Comissionamento Virtual, Gêmeo Digital, PLC TIA Portal e automação industrial.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    url: '/blog',
    siteName: 'Ikazin.io',
    title: 'Blog Técnico | Ikazin.io',
    description: 'Artigos técnicos sobre Comissionamento Virtual, Gêmeo Digital, PLC TIA Portal e automação industrial.',
    images: [{ url: '/api/og/blog/comissionamento-virtual-vs-real', width: 1200, height: 630 }],
  },
}

export default function BlogPage() {
  return <BlogClient />
}
