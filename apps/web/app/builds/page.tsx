'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarketingNav } from '../_components/marketing/MarketingNav'
import { useMarketingLang } from '../_components/marketing/LanguageToggle'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { BuildCard, type BuildCatalogItem, type BuildTier } from './BuildCard'

const tierOrder: BuildTier[] = ['basic', 'essentials', 'advanced', 'premium']

const tierLabels: Record<BuildTier, string> = {
  basic: 'Basic',
  essentials: 'Essentials',
  advanced: 'Advanced',
  premium: 'Premium',
}

const tierDescriptions: Record<BuildTier, string> = {
  basic: 'Builds 1-8',
  essentials: 'Builds 9-13',
  advanced: 'Builds 14-18',
  premium: 'Builds 19-25',
}

export default function BuildsPage() {
  const router = useRouter()
  const session = useLHSession() as any
  const [lang, setLang] = useMarketingLang()
  const [builds, setBuilds] = useState<BuildCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const status = session?.status ?? 'loading'
  const accessToken = session?.data?.tokens?.access_token

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login')
    }
  }, [router, status])

  useEffect(() => {
    if (status !== 'authenticated') return

    let isMounted = true

    async function loadBuilds() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/v1/builds', {
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })

        if (response.status === 401) {
          router.replace('/auth/login')
          return
        }

        if (!response.ok) {
          throw new Error(`Failed to load builds (${response.status})`)
        }

        const data = (await response.json()) as BuildCatalogItem[]
        if (isMounted) {
          setBuilds(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load builds')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadBuilds()

    return () => {
      isMounted = false
    }
  }, [accessToken, router, status])

  const buildsByTier = useMemo(() => {
    return tierOrder.reduce<Record<BuildTier, BuildCatalogItem[]>>(
      (groups, tier) => {
        groups[tier] = builds
          .filter((build) => build.tier === tier)
          .sort((a, b) => a.number - b.number)
        return groups
      },
      { basic: [], essentials: [], advanced: [], premium: [] }
    )
  }, [builds])

  function handleSelectBuild(build: BuildCatalogItem) {
    if (build.has_access) {
      router.push(`/builds/${build.build_uuid}`)
      return
    }

    router.push('/planos')
  }

  return (
    <div className="min-h-screen bg-ikz-bg text-gray-100">
      <MarketingNav
        lang={lang}
        onLangChange={setLang}
        copy={{
          plans: lang === 'en' ? 'Plans' : 'Planos',
          audience: lang === 'en' ? 'Who it’s for' : 'Para quem é',
          blog: 'Blog',
          login: lang === 'en' ? 'Sign in' : 'Entrar',
          cta: lang === 'en' ? 'Start now' : 'Começar agora',
        }}
      />

      <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-ikz-cyan">
            IKAZIN.IO
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
            Build catalog
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-400 md:text-lg">
            Select an unlocked build to open the training workspace, or choose a locked build to review plan access.
          </p>
        </header>

        {status === 'loading' || isLoading ? (
          <div className="rounded-lg border border-ikz-border bg-ikz-surface p-8 text-sm text-gray-400">
            Loading builds...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-8 text-sm text-red-200">
            {error}
          </div>
        ) : (
          <div className="space-y-12">
            {tierOrder.map((tier) => {
              const tierBuilds = buildsByTier[tier]
              if (tierBuilds.length === 0) return null

              return (
                <section key={tier} aria-labelledby={`${tier}-builds`}>
                  <div className="mb-5 flex items-end justify-between gap-4 border-b border-ikz-border pb-3">
                    <div>
                      <h2 id={`${tier}-builds`} className="text-xl font-black text-white md:text-2xl">
                        {tierLabels[tier]}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">{tierDescriptions[tier]}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-500">
                      {tierBuilds.length} builds
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tierBuilds.map((build) => (
                      <BuildCard key={build.build_uuid} build={build} onSelect={handleSelectBuild} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
