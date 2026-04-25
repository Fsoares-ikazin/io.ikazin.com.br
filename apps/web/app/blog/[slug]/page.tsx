import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { posts } from '../../_data/blog-posts'
import { BlogPostClient } from '../../_components/marketing/BlogPostClient'

interface Props {
  params: Promise<{ slug: string }>
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
  const { slug } = await params
  const post = posts.find(p => p.slug.en === slug || p.slug.pt === slug)
  if (!post) return { title: 'Blog | IKAZIN.IO' }

  const lang = post.slug.en === slug ? 'en' : 'pt'
  return {
    title: `${post.title[lang]} | IKAZIN.IO`,
    description: post.excerpt[lang],
  }
}

export const dynamicParams = true

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const exists = posts.some(p => p.slug.en === slug || p.slug.pt === slug)
  if (!exists) notFound()

  return <BlogPostClient slug={slug} />
}
