'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import { Search, LayoutDashboard, Grid3X3, CreditCard, User, Lock } from 'lucide-react'
import { motion } from 'motion/react'
import { modalContent } from '@/lib/ikazin/motion'
import IkazinBadge from './IkazinBadge'
import { color, type BuildTier } from '@/lib/ikazin/tokens'
import { getUriWithOrg } from '@services/config/config'

type SearchBuild = {
  id: string
  build_number: number
  title: string
  tier: BuildTier
  tags: string[]
  locked: boolean
}

export type IkazinSearchProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Catálogo', icon: Grid3X3, path: '/catalogo' },
  { label: 'Planos', icon: CreditCard, href: '/planos' },
  { label: 'Conta', icon: User, path: '/conta' },
] as const

export function useCmdK(setOpen: (open: boolean) => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setOpen])
}

export default function IkazinSearch({ open, onOpenChange }: IkazinSearchProps) {
  const params = useParams<{ orgslug: string }>()
  const router = useRouter()
  const orgslug = params?.orgslug ?? ''

  const [builds, setBuilds] = useState<SearchBuild[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open || builds.length > 0) return
    setLoading(true)
    fetch('/api/v1/ikazin/builds', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setBuilds(data.builds ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, builds.length])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  function navigate(path: string) {
    onOpenChange(false)
    router.push(path)
  }

  const filtered = query
    ? builds.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          `build ${b.build_number}`.includes(query.toLowerCase()) ||
          b.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : builds.slice(0, 8)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ animationDuration: '150ms' }}
        />
        <Dialog.Content
          className="fixed inset-x-0 top-[10vh] z-50 mx-auto max-w-lg px-4 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ animationDuration: '150ms' }}
          aria-describedby="ikz-search-description"
        >
          <Dialog.Title className="sr-only">Busca rápida</Dialog.Title>
          <p id="ikz-search-description" className="sr-only">
            Pesquise builds, seções de navegação e ações.
          </p>
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate={open ? 'visible' : 'hidden'}
            className="overflow-hidden rounded-[20px] shadow-2xl"
            style={{
              background: color.surface,
              border: `1px solid ${color.border.DEFAULT}`,
            }}
          >
            <Command shouldFilter={false} loop className="flex flex-col">
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: `1px solid ${color.border.DEFAULT}` }}
              >
                <Search className="h-4 w-4 shrink-0" style={{ color: color.text.dim }} />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Buscar build, seção..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500"
                  style={{ color: color.text.primary }}
                  autoFocus
                />
                <kbd
                  className="hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block"
                  style={{
                    borderColor: color.border.hover,
                    background: color.bg,
                    color: color.text.dim,
                  }}
                >
                  Esc
                </kbd>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                {loading && (
                  <Command.Loading>
                    <p className="py-6 text-center text-sm" style={{ color: color.text.dim }}>
                      Carregando builds...
                    </p>
                  </Command.Loading>
                )}

                {!loading && filtered.length > 0 && (
                  <Command.Group
                    heading="Builds"
                    className="[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-500"
                  >
                    {filtered.map((build) => (
                      <Command.Item
                        key={build.id}
                        value={`build-${build.build_number}-${build.title}`}
                        disabled={build.locked}
                        onSelect={() => {
                          if (!build.locked) {
                            navigate(getUriWithOrg(orgslug, `/build/${build.build_number}`))
                          }
                        }}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm outline-none aria-selected:bg-zinc-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                        style={{ color: color.text.secondary }}
                      >
                        <span
                          className="w-7 shrink-0 text-center text-xs font-black"
                          style={{ color: color.text.disabled }}
                        >
                          #{build.build_number}
                        </span>
                        <span className="flex-1 truncate">{build.title}</span>
                        <div className="flex shrink-0 items-center gap-1">
                          <IkazinBadge variant="tier" tier={build.tier} size="sm" />
                          {build.locked && <Lock className="h-3 w-3 text-zinc-600" />}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group
                  heading="Navegação"
                  className="mt-1 [&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-500"
                >
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon
                    const href =
                      'href' in item ? item.href : getUriWithOrg(orgslug, item.path)
                    return (
                      <Command.Item
                        key={item.label}
                        value={item.label}
                        onSelect={() => navigate(href)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm outline-none aria-selected:bg-zinc-800"
                        style={{ color: color.text.secondary }}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: color.text.dim }} />
                        <span>{item.label}</span>
                      </Command.Item>
                    )
                  })}
                </Command.Group>

                {!loading && filtered.length === 0 && query && (
                  <Command.Empty>
                    <p className="py-6 text-center text-sm" style={{ color: color.text.dim }}>
                      Nenhum resultado para &ldquo;{query}&rdquo;
                    </p>
                  </Command.Empty>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
