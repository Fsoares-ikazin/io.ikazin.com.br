import { PlanoDetailClient } from '../../_components/marketing/PlanoDetailClient'

export function generateStaticParams() {
  return [
    { slug: 'basic' },
    { slug: 'essentials' },
    { slug: 'advanced' },
    { slug: 'premium' },
    { slug: 'premium-plus' },
  ]
}

export default function PlanoDetailPage({ params }: { params: { slug: string } }) {
  return <PlanoDetailClient slug={params.slug} />
}
