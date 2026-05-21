'use client'

import { Archive, Microchip, Code2, FileText, Download } from 'lucide-react'

import { Button } from '@components/ui/button'
import { track } from '@/lib/ikazin/analytics'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'

type MaterialItem = {
  type: 'exe' | 'zip' | 'pdf' | 'scl'
  label: string
  available: boolean
}

type MaterialsListProps = {
  buildId?: string
  materials: MaterialItem[]
  compact?: boolean
}

const ICONS = {
  exe: Microchip,
  zip: Archive,
  pdf: FileText,
  scl: Code2,
} as const

const TOOLTIP_TEXT = 'Disponivel apos configurar storage'

function DisabledDownloadButton({
  label,
  buildId,
  fileType,
}: {
  label: string
  buildId?: string
  fileType?: MaterialItem['type'] | 'all'
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            onClick={() => {
              if (!buildId || !fileType) return
              track('download_started', {
                build_id: buildId,
                file_type: fileType,
                mocked: true,
              })
            }}
          >
            <Button
              type="button"
              disabled
              variant="ghost"
              className="h-9 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 text-xs font-semibold text-zinc-400 opacity-100"
            >
              {label}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="border-zinc-800 bg-zinc-950 text-xs text-zinc-200">
          {TOOLTIP_TEXT}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function MaterialsList({ buildId, materials, compact = false }: MaterialsListProps) {
  return (
    <div className="rounded-[20px] border border-zinc-800 bg-[#141a18] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Materiais</h2>
          <p className="mt-1 text-sm text-zinc-500">Arquivos deste build</p>
        </div>
        {!compact ? <DisabledDownloadButton label="Baixar tudo" buildId={buildId} fileType="all" /> : null}
      </div>

      <div className="space-y-3">
        {materials.map((item) => {
          const Icon = ICONS[item.type]

          return (
            <div
              key={`${item.type}-${item.label}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/55 px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-emerald-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">{item.label}</p>
                  <p className="text-xs text-zinc-500">Em breve</p>
                </div>
              </div>

              <DisabledDownloadButton label="Download" buildId={buildId} fileType={item.type} />
            </div>
          )
        })}
      </div>

      {compact ? (
        <div className="mt-4">
          <DisabledDownloadButton label="Baixar tudo" buildId={buildId} fileType="all" />
        </div>
      ) : null}
    </div>
  )
}

export function StickyDownloadBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-[#0a0e0d]/95 p-4 backdrop-blur lg:hidden">
      <div className="mx-auto max-w-7xl">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="block">
                <Button
                  type="button"
                  disabled
                  className="h-11 w-full rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-400 opacity-100"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar tudo
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="border-zinc-800 bg-zinc-950 text-xs text-zinc-200">
              {TOOLTIP_TEXT}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
