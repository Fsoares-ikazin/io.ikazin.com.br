'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Button } from '@components/ui/button'
import { getUriWithOrg } from '@services/config/config'

export default function OnboardingBanner() {
  const params = useParams<{ orgslug: string }>()
  const orgslug = params?.orgslug ?? ''

  return (
    <section className="relative overflow-hidden rounded-[20px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),_transparent_40%),linear-gradient(135deg,_rgba(20,26,24,0.96),_rgba(10,14,13,1))] px-6 py-8 sm:px-8 sm:py-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(120deg,transparent,rgba(16,185,129,0.08),transparent)] lg:block" />
      <div className="relative max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Dashboard Ikazin
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Por onde você quer começar?
        </h1>
        <p className="mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
          Escolha seu nível ou deixa a gente recomendar.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
          >
            <Link href={getUriWithOrg(orgslug, '/welcome')}>Recomende para mim →</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/70 px-5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            <Link href={getUriWithOrg(orgslug, '/catalogo')}>Ver todos os builds →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
