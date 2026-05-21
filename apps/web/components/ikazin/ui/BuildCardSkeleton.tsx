'use client'

export interface BuildCardSkeletonProps {
  /** Quantidade de skeletons a renderizar. Default: 1 */
  count?: number
  /** Se true, retorna apenas os <article> sem container grid. */
  inGrid?: boolean
}

function SkeletonCard() {
  return (
    <article
      aria-hidden="true"
      role="presentation"
      className="relative flex flex-col overflow-hidden rounded-xl border border-ikz-border bg-ikz-surface"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 skeleton-shimmer" />
        {/* Build# placeholder */}
        <div className="absolute left-2 top-2 h-5 w-10 rounded-md skeleton-shimmer" />
        {/* Tier badge placeholder */}
        <div className="absolute right-2 top-2 h-5 w-16 rounded-md skeleton-shimmer" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Title — 2 lines */}
        <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
        <div className="h-3.5 w-3/5 rounded skeleton-shimmer" />

        {/* Tags */}
        <div className="mt-1 flex gap-1">
          <div className="h-4 w-10 rounded-md skeleton-shimmer" />
          <div className="h-4 w-12 rounded-md skeleton-shimmer" />
          <div className="h-4 w-8 rounded-md skeleton-shimmer" />
        </div>

        {/* Duration */}
        <div className="mt-auto h-3 w-16 rounded skeleton-shimmer" />
      </div>
    </article>
  )
}

export default function BuildCardSkeleton({ count = 1, inGrid = false }: BuildCardSkeletonProps) {
  const cards = Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)

  if (inGrid || count === 1) {
    return <>{cards}</>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards}
    </div>
  )
}
