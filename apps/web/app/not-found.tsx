import { ArrowRight, Home, Layers3 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ikz-bg px-6 py-12 text-gray-100">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 35% 20%, hsl(var(--ikz-cyan) / 0.16) 0%, transparent 38%), radial-gradient(ellipse at 70% 75%, hsl(var(--ikz-lime) / 0.10) 0%, transparent 34%)',
        }}
      />

      <section className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Ikazin.io"
            width={58}
            height={58}
            className="h-14 w-auto"
            style={{ filter: 'drop-shadow(0 0 10px hsl(var(--ikz-cyan) / 0.45))' }}
            priority
          />
          <span className="text-xl font-black tracking-tight text-ikz-cyan">Ikazin.io</span>
        </Link>

        <p className="mb-4 rounded-full border border-ikz-cyan/30 bg-ikz-cyan/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ikz-cyan">
          Erro 404
        </p>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Esta página não está disponível.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-400 md:text-lg">
          O endereço pode ter mudado, expirado ou nunca existiu. Volte para a plataforma e continue pelas simulações ou pelos planos da Ikazin.io.
        </p>

        <div className="mt-9 grid w-full gap-3 sm:grid-cols-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ikz-cyan px-5 py-3 text-sm font-bold text-white shadow-glow transition-opacity hover:opacity-90"
          >
            <Home size={16} />
            Início
          </Link>
          <Link
            href="/builds"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ikz-border bg-ikz-surface px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-ikz-cyan/60"
          >
            <Layers3 size={16} />
            Simulações
          </Link>
          <Link
            href="/planos"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ikz-border bg-ikz-surface px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-ikz-lime/60 hover:text-ikz-lime"
          >
            Planos
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}

