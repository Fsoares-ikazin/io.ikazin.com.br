'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import BuildCard, { type BuildCardProps } from '@components/ikazin/ui/BuildCard'
import BuildCardSkeleton from '@components/ikazin/ui/BuildCardSkeleton'
import { track } from '@/lib/ikazin/analytics'
import { getPlatformUrl, getUriWithOrg } from '@services/config/config'

type HorizontalRowProps = {
  title: string
  builds: BuildCardProps[]
  emptyMessage?: string
  loading?: boolean
  skeletonCount?: number
}

const arrowVariants = {
  rest: { opacity: 0, x: 0 },
  hover: { opacity: 1, x: 0, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function HorizontalRow({
  title,
  builds,
  emptyMessage = 'Nenhum build disponível nesta seção.',
  loading = false,
  skeletonCount = 4,
}: HorizontalRowProps) {
  const params = useParams<{ orgslug: string }>()
  const orgslug = params?.orgslug ?? ''
  const scrollRef = useRef<HTMLDivElement>(null)
  const pricingHref = getPlatformUrl('/planos') ?? '/planos'

  function scrollByOffset(offset: number) {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <motion.section
      initial="rest"
      whileHover="hover"
      className="group/row"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        <Link
          href={getUriWithOrg(orgslug, '/catalogo')}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-emerald-400"
        >
          Ver todos →
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden pb-2">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="w-[78vw] shrink-0 sm:w-[280px] lg:w-[300px]">
              <BuildCardSkeleton inGrid />
            </div>
          ))}
        </div>
      ) : builds.length === 0 ? (
        <p className="text-sm italic text-zinc-400">{emptyMessage}</p>
      ) : (
        <div className="relative">
          <motion.button
            type="button"
            variants={arrowVariants}
            onClick={() => scrollByOffset(-320)}
            className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-zinc-100 shadow-lg transition-colors hover:border-emerald-500/50 hover:text-emerald-400 md:flex"
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ msOverflowStyle: 'none' }}
          >
            {builds.map((build) => {
              const href = build.locked
                ? pricingHref
                : getUriWithOrg(orgslug, `/build/${build.buildNumber}`)

              return (
                <Link
                  key={`${title}-${build.id}`}
                  href={href}
                  onClick={() => {
                    track('build_opened', {
                      build_id: build.id,
                      build_number: build.buildNumber,
                      tier: build.tier,
                      locked: build.locked,
                      source_row: title,
                    })
                  }}
                  className="block w-[78vw] shrink-0 snap-start sm:w-[280px] lg:w-[300px]"
                >
                  <BuildCard {...build} />
                </Link>
              )
            })}
          </div>

          <motion.button
            type="button"
            variants={arrowVariants}
            onClick={() => scrollByOffset(320)}
            className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-zinc-100 shadow-lg transition-colors hover:border-emerald-500/50 hover:text-emerald-400 md:flex"
            aria-label="Rolar para a direita"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      )}
    </motion.section>
  )
}
