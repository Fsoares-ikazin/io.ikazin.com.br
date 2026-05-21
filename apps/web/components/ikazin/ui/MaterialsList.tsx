'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Archive, Microchip, Code2, FileText, Download } from 'lucide-react'

import { Button } from '@components/ui/button'
import { track } from '@/lib/ikazin/analytics'
import { toast } from '@/lib/ikazin/toast'
import { copy } from '@/lib/ikazin/copy'
import { duration, ease } from '@/lib/ikazin/motion'
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
  note?: string | null
}

type MaterialsListProps = {
  buildId?: string
  materials?: MaterialItem[]
  compact?: boolean
  accessToken?: string
  isLoading?: boolean
}

const ICONS = {
  exe: Microchip,
  zip: Archive,
  pdf: FileText,
  scl: Code2,
} as const

const TOOLTIP_TEXT = 'Disponivel apos configurar storage'
const BULK_TOOLTIP_TEXT = 'Download em lote em breve'

function MaterialsListSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-[20px] border border-zinc-800 bg-[#141a18] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded skeleton-shimmer" />
          <div className="h-3 w-32 rounded skeleton-shimmer" />
        </div>
        {!compact ? <div className="h-9 w-28 rounded-xl skeleton-shimmer" /> : null}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/55 px-3 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
              <div className="min-w-0 space-y-2">
                <div className="h-3.5 w-28 rounded skeleton-shimmer" />
                <div className="h-3 w-40 rounded skeleton-shimmer" />
              </div>
            </div>
            <div className="h-9 w-24 rounded-xl skeleton-shimmer" />
          </div>
        ))}
      </div>

      {compact ? <div className="mt-4 h-9 w-28 rounded-xl skeleton-shimmer" /> : null}
    </div>
  )
}

function DisabledTooltipLabel({ text }: { text: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={text}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: duration.base, ease: ease.out }}
        className="block max-w-[18rem]"
      >
        {text}
      </motion.span>
    </AnimatePresence>
  )
}

async function requestSignedDownload(
  buildId: string,
  fileType: MaterialItem['type'],
  accessToken?: string
) {
  const response = await fetch(
    `/api/v1/ikazin/downloads/${buildId}?file_type=${encodeURIComponent(fileType)}`,
    {
      credentials: 'include',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    }
  )

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.detail ?? `HTTP ${response.status}`)
  }

  track('download_started', {
    build_id: buildId,
    file_type: fileType,
    mocked: false,
  })
  window.open(payload.url, '_blank', 'noopener,noreferrer')
}

function DisabledDownloadButton({
  label,
  buildId,
  fileType,
  tooltipText = TOOLTIP_TEXT,
}: {
  label: string
  buildId?: string
  fileType?: MaterialItem['type'] | 'all'
  tooltipText?: string
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
        <TooltipContent
          side="top"
          className="border-zinc-800 bg-zinc-950/95 text-xs text-zinc-200 backdrop-blur"
        >
          <DisabledTooltipLabel text={tooltipText} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function MaterialsList({
  buildId,
  materials = [],
  compact = false,
  accessToken,
  isLoading,
}: MaterialsListProps) {
  const [downloadingType, setDownloadingType] = useState<string | null>(null)
  const resolvedLoading = isLoading ?? materials.length === 0
  const downloadableMaterials = materials.filter((item) => item.available && item.type !== 'scl')

  async function handleDownload(fileType: MaterialItem['type']) {
    if (!buildId) return
    setDownloadingType(fileType)

    try {
      await requestSignedDownload(buildId, fileType, accessToken)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.errors.materialsDownloadFailed)
    } finally {
      setDownloadingType(null)
    }
  }

  if (resolvedLoading) {
    return <MaterialsListSkeleton compact={compact} />
  }

  return (
    <div className="rounded-[20px] border border-zinc-800 bg-[#141a18] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Materiais</h2>
          <p className="mt-1 text-sm text-zinc-500">Arquivos deste build</p>
        </div>
        {!compact ? (
          <DisabledDownloadButton
            label="Baixar tudo"
            buildId={buildId}
            fileType="all"
            tooltipText={downloadableMaterials.length ? BULK_TOOLTIP_TEXT : TOOLTIP_TEXT}
          />
        ) : null}
      </div>

      <div className="space-y-3">
        {materials.map((item) => {
          const Icon = ICONS[item.type]

          return (
            <div
              key={`${item.type}-${item.label}`}
              className={[
                'flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition-colors',
                item.available && item.type !== 'scl'
                  ? 'border-zinc-800 bg-zinc-950/55'
                  : 'border-zinc-800/90 bg-zinc-950/35',
              ].join(' ')}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={[
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-zinc-900',
                    item.available && item.type !== 'scl'
                      ? 'border-zinc-800 text-emerald-400'
                      : 'border-zinc-800/80 text-zinc-500',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">{item.label}</p>
                  <p className="text-xs text-zinc-500">
                    {item.note ??
                      (item.available && item.type !== 'scl'
                        ? 'Arquivo pronto para download'
                        : 'Arquivo ainda indisponivel')}
                  </p>
                </div>
              </div>

              {item.available && item.type !== 'scl' && buildId ? (
                <Button
                  type="button"
                  onClick={() => void handleDownload(item.type)}
                  disabled={downloadingType === item.type}
                  variant="ghost"
                  className="h-9 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
                >
                  {downloadingType === item.type ? 'Preparando...' : 'Download'}
                </Button>
              ) : (
                <DisabledDownloadButton
                  label="Download"
                  buildId={buildId}
                  fileType={item.type}
                  tooltipText={item.note ?? TOOLTIP_TEXT}
                />
              )}
            </div>
          )
        })}
      </div>

      {compact ? (
        <div className="mt-4">
          <DisabledDownloadButton
            label="Baixar tudo"
            buildId={buildId}
            fileType="all"
            tooltipText={downloadableMaterials.length ? BULK_TOOLTIP_TEXT : TOOLTIP_TEXT}
          />
        </div>
      ) : null}
    </div>
  )
}

export function StickyDownloadBar({
  hasDownloadableMaterials,
}: {
  hasDownloadableMaterials?: boolean
}) {
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
            <TooltipContent
              side="top"
              className="border-zinc-800 bg-zinc-950/95 text-xs text-zinc-200 backdrop-blur"
            >
              <DisabledTooltipLabel
                text={hasDownloadableMaterials ? BULK_TOOLTIP_TEXT : TOOLTIP_TEXT}
              />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
