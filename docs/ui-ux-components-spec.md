# IKAZIN.IO — Spec de Componentes UI

**Data:** 2026-05-20
**Escopo:** spec TypeScript + variantes + estados + animação dos componentes novos (P0/P1) e refatorados (P0/P1).
**Refs:** `apps/web/lib/ikazin/tokens.ts`, `apps/web/lib/ikazin/motion.ts`.

---

## 0. Convenções

Todos os componentes:
- **Localização:** `apps/web/components/ikazin/ui/<Name>.tsx`
- **Imports padrão:** `tokens` de `@/lib/ikazin/tokens` + `motion` variants de `@/lib/ikazin/motion`
- **Acessibilidade:** ARIA roles, keyboard nav (Tab/Esc/Enter), `prefers-reduced-motion`
- **Variantes via prop:** `variant: 'primary' | 'secondary' | ...`
- **States via prop ou children:** `loading`, `disabled`, `error`
- **Sem cores hardcoded** — sempre via tokens
- **`'use client'`** quando precisar de interatividade

---

## 1. COMPONENTES NOVOS

### 1.1 `<IkazinBadge>` — P0 (bloqueante para refactor de tiers)

**Path:** `apps/web/components/ikazin/ui/IkazinBadge.tsx`

**Props:**
```ts
type BadgeVariant = 'tier' | 'status' | 'plain'
type BadgeStatus = 'completed' | 'in_progress' | 'locked' | 'new'

interface IkazinBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant       // default 'plain'
  tier?: BuildTier             // obrigatório se variant='tier'
  status?: BadgeStatus         // obrigatório se variant='status'
  size?: 'sm' | 'md'           // default 'sm'
  icon?: LucideIcon            // ícone opcional
  className?: string
}
```

**Estados visuais:**
| variant | exemplo | cor source |
|---------|---------|------------|
| tier | "Essentials" | `tokens.tiers[t].color/textColor/bgSoft` |
| status='completed' | "Concluído" + Check | `tokens.color.success` |
| status='in_progress' | "Em progresso" | `tokens.color.primary.text` |
| status='locked' | 🔒 Bloqueado | `tokens.color.text.dim` |
| status='new' | "Novo" | `tokens.color.warning` |
| plain | qualquer | bg surface + border |

**Esqueleto:**
```tsx
'use client'
import { tier as tierToken, color } from '@/lib/ikazin/tokens'
import type { BuildTier } from '@/lib/ikazin/tokens'

export function IkazinBadge({ children, variant = 'plain', tier, status, size = 'sm', icon: Icon, className = '' }: IkazinBadgeProps) {
  const styles = useMemo(() => {
    if (variant === 'tier' && tier) {
      const t = tierToken(tier)
      return { borderColor: t.color, background: t.bgSoft, color: t.textColor }
    }
    if (variant === 'status' && status) {
      const map = {
        completed:   { color: color.success, bg: 'rgba(52,211,153,0.12)' },
        in_progress: { color: color.primary.text, bg: color.primary.soft },
        locked:      { color: color.text.dim, bg: 'rgba(63,63,70,0.4)' },
        new:         { color: color.warning, bg: 'rgba(251,191,36,0.12)' },
      }[status]
      return { borderColor: map.color, background: map.bg, color: map.color }
    }
    return undefined
  }, [variant, tier, status])

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-3 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium uppercase tracking-wider ${sizeClass} ${className}`}
      style={styles}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : 14} aria-hidden />}
      {children}
    </span>
  )
}
```

**Substituições obrigatórias após criação:**
- `BuildCard.tsx` TIER_BADGE local → `<IkazinBadge variant="tier" tier={tier}>`
- `HeroContinueCard.tsx` tier inline → idem
- `NextBuildCompactCard.tsx` → idem
- `build/[id]/page.tsx` tier badge → idem
- Estados locked/completed/in_progress em BuildCard → `<IkazinBadge variant="status" status="...">`

---

### 1.2 `<IkazinToast>` — P1

**Path:** `apps/web/components/ikazin/ui/IkazinToast.tsx`

**Props (do toast individual):**
```ts
type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number       // default 4000ms
  action?: { label: string; onClick: () => void }
  onDismiss: (id: string) => void
}
```

**API global:**
```ts
import { toast } from '@/lib/ikazin/toast'
toast.success('Build concluído!', { description: 'Próximo: Build 8' })
toast.error('Falha ao salvar progresso', { action: { label: 'Tentar de novo', onClick: retry } })
```

**Provider em `IkazinLayout`:**
```tsx
<ToastProvider>
  {children}
  <ToastViewport />  // fixed bottom-right (desktop), bottom (mobile)
</ToastProvider>
```

**Animação:** variant `toast` de `motion.ts` (slide-in da direita).

**Acessibilidade:** `role="status"` para success/info, `role="alert"` para error/warning, `aria-live`.

---

### 1.3 `<IkazinProgress>` — P1 (linear e circular)

**Path:** `apps/web/components/ikazin/ui/IkazinProgress.tsx`

**Sub-componentes:**

#### `<ProgressLine>`
```ts
interface ProgressLineProps {
  value: number       // 0-100
  height?: number     // default 4
  showLabel?: boolean
  tier?: BuildTier    // colore com tokens.tiers[t].color
  className?: string
}
```

Esqueleto:
```tsx
<div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${value}%` }}
    transition={{ duration: 0.6, ease: ease.out, delay: 0.2 }}
    style={{ background: tier ? tierToken(tier).color : color.primary.DEFAULT, boxShadow: tier ? tierToken(tier).glow : color.primary.glow }}
    className="h-full rounded-full"
  />
</div>
```

#### `<ProgressCircle>` (SVG)
```ts
interface ProgressCircleProps {
  value: number          // 0-100
  size?: number          // default 64 (px)
  strokeWidth?: number   // default 6
  tier?: BuildTier
  label?: React.ReactNode  // texto no centro
}
```

Renderiza 2 `<circle>` SVG (background + foreground), `strokeDasharray` calculado a partir de `value`. Anima `strokeDashoffset` ao mount.

**Uso no Dashboard:**
```tsx
<ProgressCircle value={tierProgressPct} tier="essentials" size={80} label={`${completed}/${total}`} />
```

---

### 1.4 `<IkazinModal>` — P1

**Path:** `apps/web/components/ikazin/ui/IkazinModal.tsx`

**Base:** `@radix-ui/react-dialog` (verificar se instalado; senão, instalar).

**Props:**
```ts
interface IkazinModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'    // default md (max-width 480/640/800)
  closeOnBackdrop?: boolean    // default true
}
```

**Esqueleto:**
```tsx
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'motion/react'
import { backdrop, modalContent } from '@/lib/ikazin/motion'
import { color, radius, zIndex } from '@/lib/ikazin/tokens'

<Dialog.Root open={open} onOpenChange={onOpenChange}>
  <AnimatePresence>
    {open && (
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild>
          <motion.div
            variants={backdrop}
            initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.6)', zIndex: zIndex.modalBackdrop }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            variants={modalContent}
            initial="hidden" animate="visible" exit="exit"
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl border p-6`}
            style={{ background: color.surface, borderColor: color.border.DEFAULT, zIndex: zIndex.modal }}
          >
            <Dialog.Title>{title}</Dialog.Title>
            {description && <Dialog.Description>{description}</Dialog.Description>}
            {children}
            {footer && <div className="mt-6 flex gap-3 justify-end">{footer}</div>}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    )}
  </AnimatePresence>
</Dialog.Root>
```

---

### 1.5 `<IkazinSearch>` — P1 (⌘K Command Palette)

**Path:** `apps/web/components/ikazin/ui/IkazinSearch.tsx`

**Lib:** `cmdk` (precisa instalar: `npm i cmdk`).

**Props:**
```ts
interface IkazinSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Atalho global:** hook `useCmdK(setOpen)` que escuta `Cmd/Ctrl + K` global.

**Estrutura:**
- Grupo "Builds" — todos os 25 builds (filtrados por plano do user)
- Grupo "Blog" — todos os posts publicados
- Grupo "Navegação" — Dashboard, Catálogo, Planos, Conta
- Grupo "Ações" — "Marcar build atual como concluído", "Resetar onboarding" (admin)

Renderiza dentro de `<IkazinModal>` para reutilizar backdrop + transição.

---

### 1.6 `<MiniPlayer>` — P1 (sticky "Assistindo agora")

**Path:** `apps/web/components/ikazin/ui/MiniPlayer.tsx`

**Context dependency:** `<NowPlayingContext>` em `lib/ikazin/now-playing-context.tsx`.

**Props:** nenhuma (lê tudo do context).

**State no context:**
```ts
interface NowPlaying {
  buildId: string
  buildNumber: number
  title: string
  thumbnailUrl: string | null
  tier: BuildTier
  currentTime: number
  duration: number
  isPlaying: boolean
}
```

**Comportamento:**
- Aparece se `nowPlaying != null` E user **não está em `/build/[buildId]`**
- Desktop: `fixed bottom-4 right-4 w-80`
- Mobile: `fixed bottom-0 left-0 right-0`
- Click em `<Maximize2>` navega para `/build/{buildId}` e remove mini-player
- Click em play/pause emite evento que o BuildVideoPlayer escuta quando montado novamente

**Animação:** variant `fadeUp` na entrada/saída.

---

### 1.7 `<BuildCardSkeleton>` — P0

**Path:** `apps/web/components/ikazin/ui/BuildCardSkeleton.tsx`

**Props:**
```ts
interface BuildCardSkeletonProps {
  count?: number        // default 1, renderiza grid se >1
  inGrid?: boolean      // se true, sem container próprio
}
```

**Forma:** mesmo `aspect-video` + `rounded-xl` + altura total do BuildCard final.

**Classe shimmer:**
```css
/* globals.css */
.skeleton-shimmer {
  background: linear-gradient(90deg,
    rgba(63,63,70,0.4) 25%,
    rgba(82,82,91,0.6) 50%,
    rgba(63,63,70,0.4) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer { animation: none; background: rgba(63,63,70,0.5); }
}
```

---

### 1.8 `<TierSectionHeader>` — P1

**Path:** `apps/web/components/ikazin/ui/TierSectionHeader.tsx`

**Props:**
```ts
interface TierSectionHeaderProps {
  tier: BuildTier
  count?: number          // "X builds"
  description?: string
}
```

**Render:**
```tsx
const t = tierToken(tier)
<header className="mb-5">
  <div
    className="rounded-xl p-5"
    style={{ background: gradient.tier(tier) }}
  >
    <div className="flex items-center gap-3">
      <IkazinBadge variant="tier" tier={tier} size="md">{t.label}</IkazinBadge>
      {count != null && <span style={{ color: t.textColor }}>{count} builds</span>}
    </div>
    {description && <p className="mt-2 text-zinc-300 text-sm">{description}</p>}
  </div>
</header>
```

---

### 1.9 `<EmptyState>` — P1

**Path:** `apps/web/components/ikazin/ui/EmptyState.tsx`

**Props:**
```ts
interface EmptyStateProps {
  illustration?: React.ReactNode    // SVG inline ou LucideIcon
  title: string
  description?: string
  cta?: { label: string; href?: string; onClick?: () => void }
  variant?: 'default' | 'compact'   // compact: para dentro de cards
}
```

**Conteúdo (catálogo) exemplo:**
```tsx
<EmptyState
  illustration={<Icon as={Search} size={48} className="text-zinc-600" />}
  title="Nenhum build em Advanced"
  description="O tier Advanced (builds 14-18) é desbloqueado a partir do plano Essentials. Você está no plano Basic."
  cta={{ label: 'Ver planos', href: '/planos' }}
/>
```

---

### 1.10 `<RecommendationCard>` — P1

**Path:** `apps/web/components/ikazin/ui/RecommendationCard.tsx`

**Props:**
```ts
interface RecommendationCardProps {
  build: HeroBuild
  reason: string         // "Porque você concluiu X..."
}
```

**Render:**
```tsx
<div className="rounded-2xl border border-emerald-500/30 p-5" style={{ background: gradient.cardHover }}>
  <p className="text-xs uppercase tracking-widest text-emerald-400 mb-2">Recomendado pra você</p>
  <h3 className="text-xl font-bold">{build.title}</h3>
  <p className="text-sm text-zinc-300 mt-2">{reason}</p>
  <Link href={`/build/${build.id}`} className="btn-primary mt-4">Começar</Link>
</div>
```

---

## 2. COMPONENTES REFATORADOS

### 2.1 `<BuildCard>` v2 — P0 + hover progressivo (P1)

**Mudanças P0:**
- Remover `TIER_BADGE` local
- Usar `<IkazinBadge variant="tier" tier={tier}>`
- Status (locked, completed, in_progress) via `<IkazinBadge variant="status">`
- Gradient overlay via `tokens.gradient.heroOverlay` (não inline rgba)

**Mudanças P1:**
- Hover progressivo: revelar descrição curta + CTA após 300ms hover
- Wrap em `<motion.article variants={cardHover}>`
- Prefetch da rota `/build/{id}` no hover

**Spec props (mantém atual + adiciona):**
```ts
interface BuildCardProps {
  id: string
  buildNumber: number
  title: string
  tier: BuildTier
  tags?: string[]
  locked?: boolean
  progress?: number          // 0-100
  thumbnailUrl?: string
  durationSeconds?: number
  // novos
  shortDescription?: string   // hover-only
  status?: 'locked' | 'in_progress' | 'completed' | 'not_started'
}
```

---

### 2.2 `<HeroContinueCard>` v2 — P0

**Mudanças:**
- Gradient via `tokens.gradient.heroOverlay` em vez de rgba inline
- Background dinâmico do tier: adicionar segundo layer com `gradient.tier(build.tier)`
- Progress: trocar `transition-all` por `<ProgressLine value={pct} tier={build.tier}>`
- Play button: usar variant `playButton` de motion.ts
- Tier badge via `<IkazinBadge variant="tier">`

**Spec props (igual atual):**
```ts
interface HeroContinueCardProps {
  build: HeroBuild
  onPlay: () => void
}
```

---

### 2.3 `<HorizontalRow>` v2 — P1 (já é 40/40 em P0)

**Mudanças P1:**
- Arrows: trocar `group-hover:opacity-100` por `motion` variant para suavidade
- Adicionar prop `loading?: boolean` que renderiza N skeletons

**Spec props:**
```ts
interface HorizontalRowProps {
  title: string
  builds: BuildSummary[]
  emptyMessage?: React.ReactNode  // pode aceitar <EmptyState>
  loading?: boolean
  skeletonCount?: number          // default 4
}
```

---

### 2.4 `<BuildVideoPlayer>` v2 — P1

**Mudanças:**
- Speed dropdown: indicador visual de seleção ativa (`background: tokens.color.primary.soft`)
- Progress overlay no próprio player com `<ProgressLine>` no bottom
- Watermark com cor de tier (`<span style={{ color: tier.textColor }}>IKAZIN</span>`)
- Notify `NowPlayingContext` em onPause/onPlay

---

### 2.5 `<NextBuildCompactCard>` v2 — P0

**Mudanças:**
- Inline styles via `tokens.tiers[t].bgSoft/glow/color`
- Wrap em `<motion.div variants={cardHover}>`
- Tier badge via `<IkazinBadge variant="tier">`

---

### 2.6 `<OnboardingBanner>` v2 — P0

**Mudanças:**
- Gradient via `tokens.gradient.onboarding`
- Botões via componente compartilhado `.btn-primary`

---

### 2.7 `<MaterialsList>` v2 — P1

**Mudanças:**
- Skeleton enquanto carrega
- Tooltips com fade animation (motion variant `fade`)
- Ícones de tipo (.exe, .zip, .pdf) com background sutil de cor (`tokens.color.primary.soft`)
- Toast de erro em vez de inline (`toast.error(...)` no catch)

---

### 2.8 `<IkazinLayout>` v2 (layout do `(ikazin)/`) — P0+P1

**Mudanças P0:**
- Wrap `<main>` em `<motion.main variants={pageTransition}>`
- Garantir `next/font` com `display: 'swap'` para Plus Jakarta + JetBrains Mono

**Mudanças P1:**
- Adicionar `<NowPlayingProvider>` ao redor de children
- Renderizar `<MiniPlayer>` global
- Renderizar `<ToastProvider>` + `<ToastViewport>`
- Adicionar `<IkazinSearch>` global + atalho `useCmdK()`

---

## 3. Acessibilidade — checklist por componente

| Componente | ARIA | Keyboard | reduced-motion |
|------------|------|----------|----------------|
| IkazinBadge | role="status" se status | — | n/a |
| IkazinToast | role="status" / "alert" + aria-live | Esc dismiss | sim — sem slide |
| IkazinProgress | role="progressbar" + aria-valuenow | — | sim — sem animação inicial |
| IkazinModal | role="dialog" + aria-labelledby | Tab trap, Esc close | sim |
| IkazinSearch | role="combobox" | seta cima/baixo, Enter, Esc | sim |
| MiniPlayer | aria-label "Mini player" | Tab para controles | n/a |
| BuildCardSkeleton | aria-hidden + role="presentation" | — | sim |
| TierSectionHeader | role="banner" subsection | — | n/a |
| EmptyState | role="status" | CTA tabbable | n/a |

---

## 4. Tabela de dependências entre componentes

```
IkazinBadge (P0) ─── usado por ─→ BuildCard, HeroContinueCard, NextBuildCompactCard
                                  TierSectionHeader, RecommendationCard

IkazinProgress (P1) ── usado por ─→ HeroContinueCard, BuildVideoPlayer, Dashboard

IkazinModal (P1) ── usado por ─→ IkazinSearch, plan-downgrade confirm,
                                  build complete dialog

IkazinToast (P1) ── usado por ─→ MaterialsList, build complete, login errors

MiniPlayer (P1) ── depende de ─→ NowPlayingContext, BuildVideoPlayer hooks

IkazinSearch (P1) ── depende de ─→ IkazinModal, cmdk lib

EmptyState (P1) ── usado por ─→ Catálogo, Dashboard, HorizontalRow.emptyMessage

RecommendationCard (P1) ── usado por ─→ Dashboard
```

**Ordem de implementação ótima:**
1. P0: IkazinBadge → refactor BuildCard/Hero/NextBuild → BuildCardSkeleton → IkazinLayout v2 P0
2. P1: IkazinProgress → IkazinToast → IkazinModal → MiniPlayer → IkazinSearch → EmptyState → RecommendationCard → TierSectionHeader

---

## 5. Diretório final esperado

```
apps/web/components/ikazin/ui/
├── BuildCard.tsx              [REFACTOR P0 + P1]
├── BuildCardSkeleton.tsx      [NOVO P0]
├── BuildVideoPlayer.tsx       [REFACTOR P1]
├── EmptyState.tsx             [NOVO P1]
├── HeroContinueCard.tsx       [REFACTOR P0]
├── HorizontalRow.tsx          [REFACTOR P1]
├── IkazinAnalyticsProvider.tsx
├── IkazinBadge.tsx            [NOVO P0]
├── IkazinModal.tsx            [NOVO P1]
├── IkazinProgress.tsx         [NOVO P1]
├── IkazinSearch.tsx           [NOVO P1]
├── IkazinToast.tsx            [NOVO P1]
├── MaterialsList.tsx          [REFACTOR P1]
├── MiniPlayer.tsx             [NOVO P1]
├── NextBuildCompactCard.tsx   [REFACTOR P0]
├── OnboardingBanner.tsx       [REFACTOR P0]
├── RecommendationCard.tsx     [NOVO P1]
└── TierSectionHeader.tsx      [NOVO P1]

apps/web/lib/ikazin/
├── analytics.ts
├── constants.ts          [DEPRECATED — re-export de tokens.ts]
├── motion.ts             [NOVO — criado nesta sessão]
├── narratives.ts         [NOVO P0 — progressNarrative()]
├── now-playing-context.tsx  [NOVO P1]
├── toast.ts              [NOVO P1 — API toast.success() etc]
└── tokens.ts             [NOVO — criado nesta sessão]
```

---

## 6. Próximos passos

1. Aprovar decisões pendentes em `docs/ui-ux-adaptation-plan.md` seção 6.
2. Começar P0.8 (IkazinBadge) — primeiro componente novo, destrava refactor dos cards.
3. Aplicar tokens em BuildCard.tsx (P0.1).
4. Validar antes/depois visualmente em `/dashboard` e `/catalogo`.
5. Seguir ordem do plano semana a semana.
