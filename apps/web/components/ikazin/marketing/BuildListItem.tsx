import { Lock } from 'lucide-react'

export type BuildListItemData = {
  number: number
  title: string
  description: string
  tags: string[]
}

type BuildListItemProps = {
  build: BuildListItemData
  isCapstone?: boolean
}

export function BuildListItem({ build, isCapstone = false }: BuildListItemProps) {
  return (
    <div className="group flex gap-5 rounded-xl border border-ikz-border bg-ikz-surface p-5 transition-all hover:-translate-y-0.5 hover:border-ikz-cyan/40">
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black',
          isCapstone ? 'bg-ikz-lime/15 text-ikz-lime' : 'bg-ikz-border text-gray-500',
        ].join(' ')}
      >
        {build.number}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold text-white">{build.title}</h3>
          <Lock size={12} className="mt-0.5 shrink-0 text-gray-700" />
        </div>
        <p className="mb-2 text-xs text-gray-500">{build.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {build.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-ikz-border px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
