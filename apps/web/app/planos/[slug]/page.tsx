import { PlanoDetailClient } from '../../_components/marketing/PlanoDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return [
    { slug: 'basic' },
    { slug: 'essentials' },
    { slug: 'advanced' },
    { slug: 'premium' },
    { slug: 'premium-plus' },
  ]
}

export default async function PlanoDetailPage({ params }: Props) {
  const { slug } = await params
  return <PlanoDetailClient slug={slug} />
}
