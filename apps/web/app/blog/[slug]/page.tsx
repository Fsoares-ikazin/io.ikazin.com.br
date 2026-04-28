import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { posts } from '../../_data/blog-posts'
import { BlogPostClient } from '../../_components/marketing/BlogPostClient'
import { JsonLd } from '@components/SEO/JsonLd'

interface Props {
  params: Promise<{ slug: string }>
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_LEARNHOUSE_PLATFORM_URL ||
    process.env.NEXT_PUBLIC_LEARNHOUSE_BACKEND_URL ||
    'https://io.ikazin.com.br'
  ).replace(/\/+$/, '')
}

function findPost(slug: string) {
  return posts.find(p => p.slug.en === slug || p.slug.pt === slug)
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
  const post = findPost(slug)
  if (!post) return { title: 'Blog | Ikazin.io' }

  const lang = post.slug.en === slug ? 'en' : 'pt'
  const siteUrl = getSiteUrl()
  const canonicalPath = `/blog/${post.slug[lang]}`
  const imageUrl = `${siteUrl}/api/og/blog/${post.slug[lang]}`

  return {
    metadataBase: new URL(siteUrl),
    title: `${post.title[lang]} | Ikazin.io`,
    description: post.excerpt[lang],
    keywords: post.seoKeywords[lang],
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: `/blog/${post.slug.en}`,
        'pt-BR': `/blog/${post.slug.pt}`,
      },
    },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      siteName: 'Ikazin.io',
      title: post.title[lang],
      description: post.excerpt[lang],
      locale: lang === 'pt' ? 'pt_BR' : 'en_US',
      publishedTime: post.date,
      modifiedTime: post.updatedAt || post.date,
      tags: post.seoKeywords[lang],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title[lang],
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title[lang],
      description: post.excerpt[lang],
      images: [imageUrl],
    },
  }
}

export const dynamicParams = true

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) notFound()

  const lang = post.slug.en === slug ? 'en' : 'pt'
  const siteUrl = getSiteUrl()
  const url = `${siteUrl}/blog/${post.slug[lang]}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title[lang],
    description: post.excerpt[lang],
    image: `${siteUrl}/api/og/blog/${post.slug[lang]}`,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    author: {
      '@type': 'Organization',
      name: 'Ikazin.io',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ikazin.io',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo-512.png`,
      },
    },
    mainEntityOfPage: url,
    inLanguage: lang === 'pt' ? 'pt-BR' : 'en',
    keywords: post.seoKeywords[lang].join(', '),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ikazin.io',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title[lang],
        item: url,
      },
    ],
  }

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogPostClient slug={slug} />
    </>
  )
}
