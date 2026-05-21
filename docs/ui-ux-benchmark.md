# IKAZIN.IO — Benchmark UI/UX

**Data:** 2026-05-20
**Objetivo:** mapear padrões de Netflix, Spotify, Linear e Vercel aplicáveis à plataforma Ikazin e gerar guidance concreto para implementação.

Cada padrão aparece com:
1. **O que é** — o pattern original
2. **Como aplicar no Ikazin** — adaptação ao contexto técnico (PLC + Digital Twin)
3. **Esqueleto de código** — TSX usando `tokens` + `motion`

---

## 1. Padrões Netflix

### 1.1 Cards de conteúdo com hover progressivo

**O que é:** Netflix começa com card "frio" (thumb + título). Hover de 300-500ms expande revelando preview, sinopse, badges. Mobile: tap abre detail page.

**Como aplicar:** BuildCard hoje já tem hover `scale 1.02 + border + shadow`. Falta o "hover delayed expand" que revela: tier completo, duração total, descrição curta, próxima ação ("Continuar a partir de 12:34").

```tsx
// Esqueleto BuildCard v2 — apenas a parte de hover progressivo
import { motion } from 'motion/react'
import { cardHover } from '@/lib/ikazin/motion'
import { tier as tierToken } from '@/lib/ikazin/tokens'

<motion.article
  variants={cardHover}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
  style={{ borderColor: tierToken(t).color, boxShadow: tierToken(t).glow }}
>
  <Thumbnail />
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    whileHover={{ opacity: 1, height: 'auto', transition: { delay: 0.3 } }}
  >
    <p>{shortDescription}</p>
    <button>Continuar a partir de {fmtTime(resumeAt)}</button>
  </motion.div>
</motion.article>
```

---

### 1.2 Hero "Continue assistindo" com gradiente lateral

**O que é:** Hero fullwidth com thumbnail full-bleed. Gradient horizontal escurece da esquerda para deixar texto legível em qualquer thumb. Progress bar fina no rodapé. CTA "Continuar" em destaque.

**Como aplicar:** HeroContinueCard já tem o gradiente e progress. Falta:
- Gradient padronizado via `tokens.gradient.heroOverlay` (não rgba inline)
- Progress bar com `tokens.color.primary.glow` (em vez de barra chapada)
- Background do hero com **cor dominante do tier do build** (gradient sutil)

```tsx
import { gradient, tier as tierToken, color } from '@/lib/ikazin/tokens'

<section className="relative h-[60vh] overflow-hidden">
  <Image src={build.thumbnailUrl} fill className="object-cover" />
  <div className="absolute inset-0" style={{ background: gradient.heroOverlay }} />
  <div
    className="absolute inset-0"
    style={{ background: `linear-gradient(135deg, ${tierToken(build.tier).bgSoft}, transparent)` }}
  />
  <div className="relative z-10 p-12 flex flex-col justify-end h-full">
    <h1>{build.title}</h1>
    <button style={{ boxShadow: color.primary.glow }}>Continuar</button>
    <div className="h-1 mt-4 bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
    </div>
  </div>
</section>
```

---

### 1.3 Rows horizontais com snap + scroll touch

**O que é:** Row horizontal de cards, scrollbar invisível, snap-mandatory, setas aparecem em hover do container.

**Como aplicar:** **HorizontalRow já tem 40/40.** Manter. Único ajuste: usar variantes de motion para fade-in das setas em vez de `group-hover:opacity-100` puro (melhor a11y).

---

### 1.4 Skeleton loader com shimmer

**O que é:** Skeleton com gradient animado horizontal (shimmer). Timing 1.5s loop. Forma exata do card final.

**Como aplicar:** Já temos `animate-pulse`. Substituir por shimmer real:

```css
/* globals.css */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(90deg,
    rgba(63,63,70,0.4) 25%,
    rgba(82,82,91,0.6) 50%,
    rgba(63,63,70,0.4) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

Criar `<BuildCardSkeleton>` com forma exata do BuildCard final (mesma altura, aspect ratio, posição de badges).

---

### 1.5 Empty states com voz do produto

**O que é:** Netflix nunca diz "Nenhum resultado". Diz "Não encontramos nada como _'%q'_. Que tal X?".

**Como aplicar:** Hoje Catálogo mostra "Nenhum build encontrado". Substituir por:

```tsx
<EmptyState
  illustration={<NoResultsIllustration />}
  title={`Sem builds em ${tierLabel}`}
  description="Esse tier é desbloqueado a partir do plano Essentials."
  cta={{ label: 'Ver planos', href: '/planos' }}
/>
```

Dashboard sem plano: "Você ainda não escolheu seu caminho. Comece pela trilha **Basic** — fundamentos de lógica booleana e drives."

---

### 1.6 Tipografia — pesos e hierarquia

Netflix usa: H1 56-72px black; H2 24-32px bold; body 14-16px regular. Letter-spacing negativo em headlines grandes (-0.02 a -0.04em).

**Aplicar:** já está em `tokens.fontSize` + `tokens.letterSpacing`. Aplicar via Tailwind theme extend para classe `text-display` etc.

---

## 2. Padrões Spotify

### 2.1 Mini-player sticky "Assistindo agora"

**O que é:** Quando user faz scroll fora da página do build, mini-player fica fixo no bottom (mobile) ou bottom-right (desktop) com thumbnail + título + play/pause + progress.

**Como aplicar:** Componente novo `<MiniPlayer>`. State global (Context ou Zustand) compartilhado entre `/dashboard`, `/catalogo`, `/build/[id]`. Aparece quando um vídeo está pausado e o user navegou para outra rota.

```tsx
// MiniPlayer.tsx
import { motion, AnimatePresence } from 'motion/react'
import { fadeUp } from '@/lib/ikazin/motion'
import { useNowPlaying } from '@/lib/ikazin/now-playing-context'

export function MiniPlayer() {
  const playing = useNowPlaying()
  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          variants={fadeUp}
          initial="hidden" animate="visible" exit="hidden"
          className="fixed bottom-4 right-4 z-toast bg-ikz-surface
                     border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3
                     md:bottom-4 md:right-4
                     max-md:left-2 max-md:right-2 max-md:bottom-2"
        >
          <Thumbnail size="sm" url={playing.thumbnailUrl} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{playing.title}</p>
            <ProgressLine pct={playing.pct} />
          </div>
          <button onClick={togglePlay}><PlayPauseIcon /></button>
          <Link href={playing.buildUrl}><Maximize2 /></Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

### 2.2 Sidebar lateral com agrupamento e estado ativo

**O que é:** Spotify tem sidebar com seções (Home, Search, Your Library) destacadas com background sutil + accent bar do lado esquerdo.

**Como aplicar:** A sidebar Ikazin atual é minimalista. Pode evoluir para Sidebar com:
- Seção "Para você" (Dashboard, Catálogo, Welcome se incompleto)
- Seção "Sua trilha" (Build atual, Próximo, Concluídos)
- Indicador ativo: `border-l-2 border-emerald-500 bg-emerald-500/5`

---

### 2.3 Cor dominante extraída da thumbnail

**O que é:** Spotify extrai cor dominante de capa de álbum e aplica em gradient atrás do título.

**Como aplicar:** Builds não têm thumbnail tão visual (são screenshots de TIA Portal). Pode-se **forçar** a cor dominante pelo `tier` — já temos `tokens.tiers[t].color` e `bgSoft`. Aplicar em `<BuildHero>`:

```tsx
const bg = tier(build.tier).bgSoft
<div style={{ background: `linear-gradient(135deg, ${bg}, transparent 60%)` }}>
  <BuildHeader />
</div>
```

---

### 2.4 Mobile bottom navigation

**O que é:** Spotify desktop tem sidebar, mobile tem bottom-nav com 4-5 itens. Padrão mobile-first em apps de mídia.

**Como aplicar:** Para a plataforma do aluno (mobile), uma bottom-nav com: Dashboard, Catálogo, Trilha (recomendação), Conta. Desktop continua sidebar/topbar atual.

---

### 2.5 Recentes + recomendados

**O que é:** "Você ouviu recentemente" + "Porque você gostou de X" — recomendação contextual.

**Como aplicar:** Endpoint `/api/v1/ikazin/recommend` já existe. Renderizar como HorizontalRow extra no Dashboard:
- "Continue de onde parou" (último build acessado, hero)
- "Próximos da sua trilha" (Recomendação contextual)
- "Builds da sua tier que você ainda não começou"
- "Concluídos" (histórico)

---

## 3. Padrões Linear / Vercel — parte técnica

### 3.1 Densidade alta sem ruído

**O que é:** Linear empacota muito dado por viewport — tabelas, badges, ícones — mas com whitespace generoso e tipografia 13-14px. Vercel idem.

**Como aplicar:** Página de admin (gestão de builds) e de progresso do user devem favorecer densidade. Spec: `text-sm` (14px), `gap-2`, badges compactos.

---

### 3.2 Badges e status indicators

**O que é:** Linear usa badges minúsculos com cor + dot. Estados: "In Progress" (yellow dot), "Done" (green), "Backlog" (gray).

**Como aplicar:** `<IkazinBadge>` componente novo com variantes:

```tsx
<IkazinBadge variant="tier" tier="essentials">Essentials</IkazinBadge>
<IkazinBadge variant="status" status="completed">Concluído</IkazinBadge>
<IkazinBadge variant="status" status="in_progress">Em progresso</IkazinBadge>
<IkazinBadge variant="status" status="locked">🔒 Bloqueado</IkazinBadge>
```

Cores via `tokens.color.success/warning/dim` + `tokens.tiers[t]`.

---

### 3.3 Code blocks no blog

**O que é:** Linear/Vercel docs usam code blocks com:
- Background levemente mais escuro que body
- Padding generoso (16-20px)
- Font: JetBrains Mono / Geist Mono 14px
- Copy button no canto superior direito
- Syntax highlight com paleta integrada

**Como aplicar:** Já há code blocks no BlogPostClient mas com cores hardcoded de GitHub. Refatorar:

```tsx
<pre
  className="rounded-lg p-5 my-4 overflow-x-auto"
  style={{ background: tokens.color.surfaceSunken, fontFamily: tokens.font.mono }}
>
  <code className="text-sm">{code}</code>
  <CopyButton text={code} />
</pre>
```

Para syntax highlight em PLC code (SCL/ladder), usar **Shiki** com tema custom Ikazin.

---

### 3.4 Feedback states

**O que é:** Linear/Vercel têm 4 estados consistentes: success (verde), error (vermelho), warning (amber), info (azul). Sempre com ícone + texto.

**Como aplicar:** `<IkazinToast>` + `<IkazinAlert>` usam `tokens.color.success/error/warning/info`. Já validados WCAG AA em tokens.

---

### 3.5 ⌘K Command palette

**O que é:** Cmd+K abre busca global. Linear, Vercel, Notion, GitHub — todos têm. Permite jump rápido para "Build 14", "Configurações", "PID controller blog post" etc.

**Como aplicar:** `<IkazinSearch>` componente. Lib: `cmdk` (já popular). Indexa: builds, blog posts, páginas estáticas, materiais. Atalho global `⌘K` / `Ctrl+K`.

```tsx
import { Command } from 'cmdk'

<Command.Dialog open={open} onOpenChange={setOpen}>
  <Command.Input placeholder="Buscar build, artigo, configuração..." />
  <Command.List>
    <Command.Group heading="Builds">
      {builds.map(b => (
        <Command.Item onSelect={() => router.push(`/build/${b.id}`)}>
          {b.build_number}. {b.title}
        </Command.Item>
      ))}
    </Command.Group>
    <Command.Group heading="Blog">{...}</Command.Group>
  </Command.List>
</Command.Dialog>
```

---

## 4. Padrões de pertencimento e personalização

### 4.1 Saudação com nome + contexto

**O que é:** "Bom dia, Pedro" + "Você está no build 7 de 8 do **Basic**. Falta 1 para Essentials se abrir."

**Como aplicar:** Dashboard header já mostra HeroContinueCard. Adicionar:

```tsx
<header>
  <h1>{greeting()}, {user.first_name}</h1>
  <p>{progressNarrative(user)}</p>
</header>
```

`progressNarrative()` retorna mensagem contextual baseada em % do tier atual, builds restantes, etc.

---

### 4.2 Progresso visível e celebratório

**O que é:** Duolingo/Spotify/Apple Fitness — barra de progresso sempre visível, animações celebrativas em milestones.

**Como aplicar:**
- Barra circular de % do tier (header do dashboard)
- Animação `milestone` (do `motion.ts`) quando build é concluído
- Notificação "🎉 Você completou o tier Basic" via toast

---

### 4.3 Recomendações contextuais

**O que é:** "Porque você assistiu PID Controller, te indicamos Cascade Loop".

**Como aplicar:** Endpoint `/recommend` já dá próximo build. Renderizar com narrativa:

```tsx
<RecommendationCard>
  <p className="text-xs text-zinc-400">Próximo passo recomendado</p>
  <BuildCard {...recommended} />
  <p className="text-xs">
    Porque você concluiu <strong>{lastCompleted.title}</strong>,
    a próxima peça da trilha é <strong>{recommended.title}</strong>.
  </p>
</RecommendationCard>
```

---

### 4.4 Empty states com voz do produto Ikazin

Voz da Ikazin (extraída do CLAUDE.md + scope): técnica, direta, brasileira, sem hype. Engenheiro pra engenheiro.

| Contexto | Texto genérico ❌ | Voz Ikazin ✓ |
|----------|------------------|-------------|
| Sem builds completos | "Você ainda não concluiu nada" | "Comece pelo Build 1 — fundamentos de lógica booleana com TIA Portal." |
| Catálogo vazio para filtro | "Nenhum resultado" | "Nenhum build com a tag _'SINAMICS'_ no seu plano atual. O tier Advanced (builds 14-18) cobre isso." |
| Sem materiais para download | "Sem arquivos" | "Os arquivos .exe + projeto TIA Portal entram no bucket assim que a gravação for publicada." |

---

### 4.5 Plano/tier como identidade

**O que é:** Steam mostra horas jogadas no perfil. LinkedIn mostra cargo. **Ikazin pode mostrar tier atual como medalha de identidade.**

**Como aplicar:**
- Avatar com ring colorido do tier do user (`border-2 border-emerald-500` para Premium)
- Badge "Essentials Member" próximo do nome em qualquer header
- Página de perfil mostra: "Plano Essentials desde 2026-03-15 · 9 builds concluídos · 14h de estudo"

---

## 5. Padrões de performance percebida

### 5.1 Optimistic UI

**O que é:** Clica em "Marcar concluído" → UI atualiza imediato; backend confirma depois. Se falhar, rollback com toast.

**Como aplicar:** `/ikazin/progress/complete` — após click no botão, atualizar estado local (`setCompleted(true)`) antes do fetch. Em catch, rollback + toast.

```tsx
async function markComplete() {
  setCompleted(true) // optimistic
  try {
    await fetch('/api/v1/ikazin/progress/complete', { ... })
  } catch (e) {
    setCompleted(false) // rollback
    toast.error('Não consegui salvar. Tente de novo.')
  }
}
```

---

### 5.2 Skeleton loaders — timing certo

**O que é:** Skeleton aparece se loading >200ms (senão flash). Loading entre 200-1000ms = skeleton. Acima de 1s = skeleton + progress hint.

**Como aplicar:** Usar `useDeferredValue` ou debounce de 150ms antes de mostrar skeleton. Para fetches longos, adicionar texto "Buscando seus builds..." após 1s.

---

### 5.3 Lazy loading de imagens e vídeos

**O que é:** `<img loading="lazy">`, `<video preload="none">`, IntersectionObserver para autoplay/load.

**Como aplicar:** Já aplicado em blog. Verificar BuildCard thumbnails — adicionar `loading="lazy"` exceto no primeiro do hero (que é `priority`).

---

### 5.4 Prefetch de próxima página

**O que é:** Next.js `<Link prefetch={true}>` por padrão. Hover em link prefetcha route.

**Como aplicar:** BuildCard envolve link → verificar se Next está prefetching. Para build pages pesadas (com vídeo), considerar prefetch só em hover (`prefetch={false}` + manual `router.prefetch()` em hover).

---

### 5.5 Transição de página sem flash branco

**O que é:** Páginas dark devem permanecer dark durante transição. Sem white flash.

**Como aplicar:**
- Root layout já tem dark mode forçado
- Adicionar `<motion.main>` com variant `pageTransition` (já no `motion.ts`)
- Configurar `next.config.js` com transição custom se necessário

---

### 5.6 Service Worker

**O que é:** Cache de assets estáticos (CSS, JS chunks, fontes) para repeat-visits instantâneos.

**Como aplicar:** **NÃO ainda.** Adia para P2 ou P3. Foco em fundamentos antes de PWA.

---

## 6. Resumo — mapa de patterns para componentes Ikazin

| Pattern source | Pattern | Componente Ikazin alvo | Prioridade |
|----------------|---------|------------------------|------------|
| Netflix | Hover progressivo | BuildCard refactor | P1 |
| Netflix | Hero overlay gradient | HeroContinueCard refactor | P0 |
| Netflix | Skeleton shimmer | BuildCardSkeleton novo | P0 |
| Netflix | Empty state com voz | Catálogo + Dashboard | P1 |
| Spotify | Mini player sticky | MiniPlayer novo | P1 |
| Spotify | Tier-colored gradient | HeroContinueCard + BuildHero | P0 |
| Spotify | Mobile bottom nav | IkazinLayout v2 | P2 |
| Spotify | Recomendações contextuais | DashboardRecommendations novo | P1 |
| Linear | Badges status | IkazinBadge novo | P0 |
| Linear | Code blocks Shiki | BlogPostClient refactor | P1 |
| Linear | ⌘K Command palette | IkazinSearch novo | P1 |
| Linear | Feedback toasts | IkazinToast novo | P0 |
| Pertencimento | Saudação personalizada | Dashboard header | P0 |
| Pertencimento | Progresso celebratório | TierProgress + Milestone | P1 |
| Pertencimento | Plano como identidade | Avatar ring + badge | P1 |
| Performance | Optimistic UI | Build complete flow | P1 |
| Performance | Skeleton timing | RowSkeleton refactor | P0 |
| Performance | Page transition | Layout wrapper | P0 |

---

## 7. Anti-patterns a evitar

Extraído de `docs/brand-dna.md` + observação de produtos brasileiros tipo Alura/Rocketseat:

- ❌ Carrosséis com autoplay forçado
- ❌ Cards com 10 informações tentando se vender — escolher 3-4
- ❌ Confetes/animações exageradas em milestones (uma vez tudo bem, sempre é cansativo)
- ❌ Mensagens "motivacionais" genéricas tipo "Você consegue!" — usuário é engenheiro, prefere dados ("Faltam 3 builds para Essentials")
- ❌ Pop-ups de "estamos coletando seu feedback" no meio da sessão
- ❌ Skeumorfismo 3D pesado — manter sutil
- ❌ Mix de várias fonts — só Plus Jakarta Sans + JetBrains Mono
- ❌ Cores fora da paleta token — sempre via `tokens.color.*`

---

## 8. Referências externas

- Netflix Tech Blog — "Smooth feeling" e Optimistic UI patterns
- Spotify Design — "Designing for the Spotify Connect" sobre mini-player state
- Linear Documentation — densidade e feedback
- Vercel Design System — dark mode tokens, Geist
- Refactoring UI (Wathan/Schoger) — escala tipográfica e contraste
- WAVE / Lighthouse / axe-core — validação WCAG

---

## 9. Próximos passos

Mapeamento → spec → implementação:

1. Especificar cada componente novo/refatorado: `docs/ui-ux-components-spec.md`
2. Aplicar tokens em código existente: P0 do `docs/ui-ux-adaptation-plan.md`
3. Construir os componentes novos (MiniPlayer, IkazinBadge, IkazinSearch, IkazinToast): P1 do plano
4. Iterar com base nos primeiros 100 alunos: P2
