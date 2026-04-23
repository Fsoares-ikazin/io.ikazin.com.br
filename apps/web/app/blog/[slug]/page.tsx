import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { posts } from '../../_data/blog-posts'
import { BlogPostClient } from '../../_components/marketing/BlogPostClient'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs: { slug: string }[] = []
  for (const post of posts) {
    slugs.push({ slug: post.slug.en })
    slugs.push({ slug: post.slug.pt })
  }
  return slugs
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = posts.find(p => p.slug.en === params.slug || p.slug.pt === params.slug)
  if (!post) return { title: 'Blog | IKAZIN.IO' }

  const lang = post.slug.en === params.slug ? 'en' : 'pt'
  return {
    title: `${post.title[lang]} | IKAZIN.IO`,
    description: post.excerpt[lang],
  }
}

export const dynamicParams = true

export default function BlogPostPage({ params }: Props) {
  const exists = posts.some(p => p.slug.en === params.slug || p.slug.pt === params.slug)
  if (!exists) notFound()

  return <BlogPostClient slug={params.slug} />
}
