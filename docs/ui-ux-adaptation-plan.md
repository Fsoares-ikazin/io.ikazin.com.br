# IKAZIN.IO — Plano de Adaptação UI/UX

**Data:** 2026-05-20
**Status:** plano não implementado (exceção: `tokens.ts` e `motion.ts` criados nesta sessão)
**Inputs:** `docs/ui-ux-audit.md` + `docs/ui-ux-benchmark.md`
**Roadmap:** P0 (1-2 semanas) → P1 (3-4 semanas) → P2 (após primeiros 100 alunos)

---

## 0. Decisões registradas (CLAUDE.md atualizado)

| Decisão | Valor | Onde |
|---------|-------|------|
| Paleta autoritativa | Emerald + Zinc | `apps/web/lib/ikazin/tokens.ts` |
| Tipografia | Plus Jakarta Sans + JetBrains Mono | tokens |
| Brand-dna.md (lime+cyan) | DEPRECATED até RFC | `docs/brand-dna.md` |
| Motion library | `motion@12.34.3` (já instalado) | `apps/web/lib/ikazin/motion.ts` |

---

## 1. P0 — impacto imediato, esforço baixo (1-2 semanas)

**Critério:** problemas críticos de acessibilidade, cores hardcoded, conflitos arquiteturais que travam P1.

Total estimado: **22-30 horas**.

### P0.1 — Aplicar Tokens 2.0 nos componentes existentes

| # | Arquivo | Mudança | Tempo |
|---|---------|---------|-------|
| 1 | `apps/web/lib/ikazin/constants.ts` | Re-export de `tokens.ts` (deprecated alias). Adicionar `@deprecated` JSDoc | 15min |
| 2 | `apps/web/components/ikazin/ui/BuildCard.tsx` | Remover `TIER_BADGE` local. Importar de `tokens.TIERS`. Cor de tier text vem de `tokens.tiers[t].textColor` | 30min |
| 3 | `apps/web/components/ikazin/ui/HeroContinueCard.tsx` | Substituir gradientes inline rgba por `tokens.gradient.heroOverlay` e `tokens.gradient.tier(tier)` | 30min |
| 4 | `apps/web/components/ikazin/ui/NextBuildCompactCard.tsx` | Inline styles via `tokens.tiers[t].bgSoft/glow` | 20min |
| 5 | `apps/web/components/ikazin/ui/OnboardingBanner.tsx` | gradient via `tokens.gradient.onboarding` | 15min |
| 6 | `apps/web/components/ikazin/ui/BuildVideoPlayer.tsx` | watermark + overlay via `tokens.gradient.videoControls` | 20min |
| **Subtotal** | | | **~2h** |

**Antes/depois (exemplo):**
```tsx
// ❌ ANTES — BuildCard.tsx
const TIER_BADGE = { basic: 'border-zinc-600 bg-zinc-800/70 text-zinc-300', ... }
<span className={TIER_BADGE[tier]}>Basic</span>

// ✓ DEPOIS
import { tier as tierToken } from '@/lib/ikazin/tokens'
const t = tierToken(tier)
<span style={{ borderColor: t.color, background: t.bgSoft, color: t.textColor }}>
  {t.label}
</span>
```

---

### P0.2 — Corrigir contraste WCAG AA (acessibilidade)

| # | Arquivo | Linha | Mudança | Tempo |
|---|---------|-------|---------|-------|
| 1 | `LandingClient.tsx` | 370 | `text-gray-500` → `text-zinc-300` | 5min |
| 2 | `PlanosClient.tsx` | 158 | `text-gray-500` → `text-zinc-300` | 5min |
| 3 | `catalogo/page.tsx` | 35-40 | substituir tier text hardcoded por `tokens.tiers[t].textColor` | 30min |
| 4 | `BuildCard.tsx` | clock row | `text-zinc-400` → `text-zinc-300` | 5min |
| 5 | `HorizontalRow.tsx` | empty | `text-zinc-500` → `text-zinc-400` | 5min |
| 6 | Global grep | — | `grep -rn "text-zinc-500\|text-gray-500" apps/web/app/orgs/[orgslug]/(ikazin)/ apps/web/components/ikazin/` e revisar manualmente | 30min |
| **Subtotal** | | | | **~1.5h** |

**Validação:** rodar Lighthouse + axe-core em `/dashboard`, `/catalogo`, `/build/1`, `/planos`. Meta: 0 erros de contraste em texto.

---

### P0.3 — Migrar site público para paleta emerald

**Problema:** marketing pages (`_components/marketing/*`) usam `ikz-lime`, `ikz-cyan`, `shadow-glow-lime-lg` — restos da brand-dna deprecated.

**Decisão simplificada:** adicionar **aliases CSS** que mapeiam `ikz-lime` → emerald e `ikz-cyan` → emerald-light, evitando refactor classe-por-classe. Em sprint posterior, refatorar nomes.

| # | Mudança | Tempo |
|---|---------|-------|
| 1 | Em `apps/web/styles/globals.css`, adicionar: `:root { --ikz-lime: #10b981; --ikz-cyan: #34d399; --ikz-bg: #0a0e0d; --ikz-surface: #141a18; }` | 15min |
| 2 | Verificar `tailwind.config.js` — se cores customizadas usam variável, ajustar | 30min |
| 3 | Validar visualmente as 5 marketing pages | 30min |
| 4 | Refator dos tokens `--ikz-drives` e `--ikz-dt` (blog tags) → criar em globals: `--ikz-tag-drives: #c084fc; --ikz-tag-dt: #fb923c;` | 15min |
| 5 | Substituir `bg-[rgba(168,85,247,0.12)]` em `BlogClient.tsx:42-47` por classe usando token | 30min |
| **Subtotal** | | **~2h** |

---

### P0.4 — Corrigir violação de dark mode em /home

`apps/web/app/orgs/[orgslug]/home/home.tsx:49` — `bg-white text-gray-900`.

| # | Mudança | Tempo |
|---|---------|-------|
| 1 | Trocar `bg-white text-gray-900` → `bg-ikz-surface text-zinc-100` e adaptar borders/cards | 45min |
| 2 | Validar fluxo (login → home → escolher org) | 15min |
| **Subtotal** | | **~1h** |

**Cuidado:** este arquivo é LH-stock. Verificar se está em `/orgs/[orgslug]/(ikazin)/` ou fora. Se fora, **PARAR e reportar** (CLAUDE.md regra 1).

> **Decisão pendente:** se o arquivo for fora de `/ikazin/`, criar **shadow page** dentro de `(ikazin)/home/` que override o LH-stock.

---

### P0.5 — Animações faltantes (Catálogo + Dashboard)

| # | Arquivo | Mudança | Tempo |
|---|---------|---------|-------|
| 1 | `catalogo/page.tsx` | Wrap grid em `<motion.div variants={staggerDefault}>` e cada `<BuildCard>` em `<motion.div variants={fadeUp}>` | 1h |
| 2 | `catalogo/page.tsx` | Filter buttons: `hover:scale-105 transition-transform` | 15min |
| 3 | `dashboard/page.tsx` | RowSkeleton com shimmer (não `animate-pulse`) | 1h |
| 4 | `globals.css` | Adicionar `@keyframes shimmer` e classe `.skeleton-shimmer` | 30min |
| 5 | `_components/IkazinLayout` (ou layout (ikazin)/) | Wrap `<main>` em `<motion.main variants={pageTransition}>` | 45min |
| **Subtotal** | | | **~3.5h** |

---

### P0.6 — Próximos passos no Welcome e CTA states

| # | Mudança | Tempo |
|---|---------|-------|
| 1 | `welcome/page.tsx:230` — submitting state com `<Loader2 className="animate-spin" />` | 15min |
| 2 | StepCard com hover (`group hover:scale-[1.02] hover:shadow-lg`) | 20min |
| 3 | Build complete button (build/[id]) — optimistic UI + rollback toast | 1.5h |
| **Subtotal** | | **~2h** |

---

### P0.7 — Font display:swap + JetBrains Mono

| # | Mudança | Tempo |
|---|---------|-------|
| 1 | Em `apps/web/app/orgs/[orgslug]/(ikazin)/layout.tsx`, garantir que `Plus_Jakarta_Sans({ display: 'swap' })` está configurado (verificar `next/font/google`) | 15min |
| 2 | Adicionar `JetBrains_Mono({ display: 'swap', variable: '--font-mono' })` no mesmo layout | 30min |
| 3 | Aplicar `font-mono` em code blocks do blog (já tem, mas via CSS hardcoded) | 30min |
| **Subtotal** | | **~1h** |

---

### P0.8 — Componente IkazinBadge (extração obrigatória)

Toda a refatoração de tier badges depende deste componente. Spec completo em `docs/ui-ux-components-spec.md` (seção 2.1).

| # | Mudança | Tempo |
|---|---------|-------|
| 1 | Criar `apps/web/components/ikazin/ui/IkazinBadge.tsx` (variants: tier, status, plain) | 1.5h |
| 2 | Substituir tier badges em BuildCard, HeroContinueCard, NextBuildCompactCard, build/[id] | 1.5h |
| **Subtotal** | | **~3h** |

---

### P0.9 — Skeleton com shimmer + BuildCardSkeleton

| # | Mudança | Tempo |
|---|---------|-------|
| 1 | Criar `apps/web/components/ikazin/ui/BuildCardSkeleton.tsx` com forma exata do BuildCard | 1h |
| 2 | Substituir skeleton genérico em Dashboard, Catálogo | 30min |
| **Subtotal** | | **~1.5h** |

---

### P0.10 — Saudação personalizada no Dashboard

| # | Mudança | Tempo |
|---|---------|-------|
| 1 | `dashboard/page.tsx` header — adicionar `<h1>Olá, {user.first_name}</h1>` + `<p>{progressNarrative}</p>` | 1h |
| 2 | Criar helper `lib/ikazin/narratives.ts` com `progressNarrative(state)` | 1h |
| **Subtotal** | | **~2h** |

---

### Total P0: ~22-30h (1.5-2 semanas focadas)

---

## 2. P1 — alto impacto, esforço médio (3-4 semanas)

**Critério:** features que elevam percepção de produto, mas não bloqueiam beta.

Total estimado: **40-55 horas**.

### P1.1 — MiniPlayer sticky "Assistindo agora"

| Item | Tempo |
|------|-------|
| `NowPlayingContext` global (state do build em pausa) | 2h |
| Componente `<MiniPlayer>` desktop + mobile | 3h |
| Hook into BuildVideoPlayer (`onPause` salva state) | 1h |
| Integração layout (sempre presente exceto no /build/[id]) | 1h |
| **Subtotal** | **~7h** |

---

### P1.2 — ⌘K Command Palette `<IkazinSearch>`

| Item | Tempo |
|------|-------|
| Instalar `cmdk` (`npm i cmdk`) | 10min |
| Componente `<IkazinSearch>` com grupos (Builds, Blog, Páginas) | 3h |
| Hook global de atalho `useCmdK()` | 30min |
| Index estático de builds (fetch + cache no client) | 1.5h |
| **Subtotal** | **~5h** |

---

### P1.3 — `<IkazinToast>` system

| Item | Tempo |
|------|-------|
| Componente `<IkazinToast>` + `<ToastProvider>` | 2h |
| `toast()` API (success/error/warning/info) | 1h |
| Integrar com Build complete, Materials download, errors gerais | 1h |
| **Subtotal** | **~4h** |

> Alternativa: usar `sonner` (lib popular) e estilizar via tokens. Reduz tempo em ~50%.

---

### P1.4 — `<IkazinProgress>` (circular + linear)

| Item | Tempo |
|------|-------|
| Componente `<TierProgress>` circular SVG animado | 2h |
| Componente `<ProgressLine>` linear (já temos parcial) | 1h |
| Integração no Dashboard header (mostrar % do tier atual) | 1h |
| **Subtotal** | **~4h** |

---

### P1.5 — `<IkazinModal>` com backdrop blur

| Item | Tempo |
|------|-------|
| Componente `<IkazinModal>` (Radix Dialog + motion variants `backdrop` + `modalContent`) | 3h |
| Substituir alguns `<dialog>` nativos ou Radix puros pelo wrapper | 1h |
| **Subtotal** | **~4h** |

---

### P1.6 — BuildCard com hover progressivo

| Item | Tempo |
|------|-------|
| Refactor BuildCard com 2 níveis: rest + hover-expanded | 2h |
| Acessibilidade: garantir keyboard nav abre detalhes | 1h |
| **Subtotal** | **~3h** |

---

### P1.7 — TierSectionHeader (catálogo)

| Item | Tempo |
|------|-------|
| Componente `<TierSectionHeader>` com gradient `tokens.gradient.tier(t)` | 1.5h |
| Aplicar no Catálogo | 30min |
| **Subtotal** | **~2h** |

---

### P1.8 — Recomendações contextuais no Dashboard

| Item | Tempo |
|------|-------|
| Endpoint já existe (`/recommend`) — criar `<RecommendationCard>` | 2h |
| Adicionar HorizontalRow "Recomendado para você" no Dashboard | 1h |
| **Subtotal** | **~3h** |

---

### P1.9 — Code blocks com Shiki no blog

| Item | Tempo |
|------|-------|
| Instalar `shiki` (`npm i shiki`) | 10min |
| Wrapper `<CodeBlock language="scl">` com Shiki + tema custom | 3h |
| Substituir code blocks em `renderBlock()` do BlogPostClient | 1.5h |
| **Subtotal** | **~5h** |

---

### P1.10 — Refactor de marketing components (extrair TierCard, FeaturedPostCard)

| Item | Tempo |
|------|-------|
| `<TierCard>` componente | 2h |
| `<FeaturedPostCard>` componente | 1.5h |
| `<BuildListItem>` componente | 1h |
| Substituir nos clients | 1.5h |
| **Subtotal** | **~6h** |

---

### P1.11 — Empty states com voz Ikazin

| Item | Tempo |
|------|-------|
| Componente `<EmptyState>` reutilizável (ilustração + título + descrição + CTA) | 1.5h |
| Conteúdo redigido para 5+ contextos (catálogo, dashboard sem plano, blog sem post, etc) | 1h |
| Aplicar | 1.5h |
| **Subtotal** | **~4h** |

---

### P1.12 — Plano/tier como identidade visual

| Item | Tempo |
|------|-------|
| Avatar com ring colorido do tier (componente) | 1h |
| Badge "Membro Essentials" no topbar | 30min |
| Página de perfil simples (`/conta`) com stats | 2h |
| **Subtotal** | **~3.5h** |

---

### Total P1: ~50h (~3 semanas focadas, ou 4-5 semanas part-time)

---

## 3. P2 — diferenciais, esforço alto (após primeiros 100 alunos)

Refinamentos que dependem de feedback real e métricas.

### P2.1 — Thumbnails com cor dominante extraída

Usar `node-vibrant` ou similar para extrair cor dominante de thumbnails reais (quando os builds forem gravados). Aplicar como gradient atrás do hero/card. **Tempo estimado:** 8h.

### P2.2 — Animações de milestone

Confete moderado (lib `canvas-confetti`) ao completar build. Animação grande ao completar tier inteiro. **Tempo estimado:** 4h.

### P2.3 — Modo compacto vs confortável no catálogo

Toggle de densidade (estilo Gmail). Salvo em `localStorage`. **Tempo estimado:** 5h.

### P2.4 — Personalização do dashboard por comportamento

Reordenar HorizontalRows baseado em uso (mais visitados ficam em cima). **Tempo estimado:** 12h (envolve backend + analytics).

### P2.5 — Mobile bottom navigation

Bottom nav nativo mobile com 4-5 entradas. **Tempo estimado:** 6h.

### P2.6 — Service Worker / PWA

Cache de assets, offline gracioso para conteúdo já baixado. **Tempo estimado:** 15h.

### P2.7 — Admin Plus Jakarta + emerald migration

Aplicar identidade Ikazin no admin LH (ver `ui-ux-audit.md` seção 5). **Tempo estimado:** 6h.

### Total P2: ~56h (3-4 semanas focadas, ou diluído em 2-3 meses)

---

## 4. Roadmap visual em semanas

Assume 1 dev solo, ~20h/semana dedicadas a UI.

| Semana | Prioridade | Itens principais | Arquivos tocados | Horas |
|--------|-----------|------------------|------------------|-------|
| 1 | P0.1-P0.4 | Aplicar tokens + WCAG + paleta site + dark mode home | ~12 arquivos componentes + 5 marketing | 6-8h |
| 2 | P0.5-P0.10 | Animações + Welcome + fonts + IkazinBadge + skeleton + saudação | Layouts, dashboard, catálogo, IkazinBadge novo, narratives | 12-16h |
| 3 | P1.1-P1.3 | MiniPlayer + ⌘K + Toast | NowPlaying, IkazinSearch, IkazinToast | 14-16h |
| 4 | P1.4-P1.7 | Progress + Modal + BuildCard hover + TierSection | IkazinProgress, IkazinModal, BuildCard, catálogo | 12-14h |
| 5 | P1.8-P1.10 | Recomendações + Shiki + refactor marketing | Dashboard, BlogPost, marketing clients | 14-16h |
| 6 | P1.11-P1.12 | Empty states + identidade de tier | EmptyState, perfil, avatar ring | 6-8h |
| **6 semanas** | **P0 + P1 completos** | — | — | **~75h** |
| 7+ | P2 conforme métricas | Confete, modo compacto, mobile nav, PWA | — | iterativo |

---

## 5. Validações antes do beta

Cada P0 e P1 deve ser validado em:

- [ ] Lighthouse Performance ≥ 80 / Accessibility ≥ 95 / Best Practices ≥ 95
- [ ] axe-core: 0 violations críticas
- [ ] Manual: testar com keyboard apenas em `/dashboard`, `/catalogo`, `/build/1`, `/planos`
- [ ] Manual: `prefers-reduced-motion` respeitado
- [ ] Visual regression: comparar screenshots antes/depois (manual ou Playwright)
- [ ] Manual mobile: iPhone 12 + Android Chrome (320-414px width)

---

## 6. Decisões ratificadas (2026-05-20)

| # | Decisão | Valor | Motivo |
|---|---------|-------|--------|
| 1 | Lib de toast | **`sonner`** | ~6KB gzip + stack/swipe/promise nativos. Economiza 2.5h vs próprio. Estilizar via `tokens` em `<Toaster toastOptions={{ style }}>`. |
| 2 | Lib de Modal | **Radix Dialog + wrapper `<IkazinModal>`** | A11y industrial-grade grátis (focus trap, ARIA, Esc, scroll lock). vaul fica reservado para bottom-sheets mobile específicos no futuro. |
| 3 | MiniPlayer cross-session | **Só na mesma sessão** | Zero localStorage I/O, sem hydration mismatch. Usuário que volta no dia seguinte vê hero, não MiniPlayer órfão. |
| 4 | Bottom nav mobile | **P2** (após primeiros 100 alunos) | 4 rotas cabem no topbar. Sem analytics real, decisão de posicionamento vira chute. Adia 6h, libera espaço para ⌘K + MiniPlayer no P1. |
| 5 | Voz empty states | **Copy proposto em `benchmark.md` § 4.4 + revisão trimestral** | Voz "engenheiro pra engenheiro" alinha brand. Centralizar em `apps/web/lib/ikazin/copy.ts` para refac fácil. |
| 6 | Avatar ring | **Maior tier desbloqueado historicamente** | Ring sobe nunca volta — progresso permanente. Backend: `user.details["ikazin_max_tier_ever"]` set no upgrade, nunca decrement. |
| 7 | Light mode | **Nunca** | Dark forçado fica como em CLAUDE.md + brand-dna. -40% CSS, -50% QA visual. Engenheiro industrial usa workstation dark. |

### Impactos no roadmap

- **P1.3 IkazinToast**: substituir por **`sonner` integration** (1.5h em vez de 4h). Economia: 2.5h.
- **P1.5 IkazinModal**: confirmado wrapper sobre Radix Dialog. Spec em `components-spec.md` § 1.4 já reflete.
- **P1.1 MiniPlayer**: state em React Context (não persistido). Reset on tab close.
- **P1.12 Avatar ring**: requer migration backend adicionar coluna/campo `ikazin_max_tier_ever` (incluir em P1.12). +1h.
- **P2.5 Mobile bottom nav**: mantém em P2, sem mudança.
- **`apps/web/lib/ikazin/copy.ts`**: novo arquivo P1 — centraliza strings de empty states + saudações + narratives. ~1h.

### Total revisado

- P1 antes: ~50h
- P1 depois das decisões: **~49h** (economia 2.5h sonner, custo +1h backend max_tier, +0.5h copy.ts = saldo -1h)

---

## 7. Riscos

| Risco | Mitigação |
|-------|-----------|
| Site público marketing tem muitos arquivos com `ikz-lime` — refactor manual pode quebrar visual | Estratégia P0.3 com aliases CSS evita refactor classe-por-classe |
| `motion` lib pode dar problema em SSR | Usar `<LazyMotion>` wrapper conforme docs |
| `cmdk` (⌘K) precisa indexar conteúdo — se index for grande, performance | Lazy-load index após primeiro `⌘K` |
| Shiki bundle size — ~200KB extra | Code-split via dynamic import no blog |
| Cores hardcoded escondidas em arquivos não auditados | Após P0, rodar `grep -rn '#[0-9a-fA-F]\{3,6\}' apps/web` e revisar |
| Conflito futuro com upstream LearnHouse (rebase) | Tokens.ts e motion.ts ficam em `/lib/ikazin/` (isolado) — sem conflito |

---

## 8. Métricas pós-implementação

Após P0+P1:

| Métrica | Baseline | Meta P0 | Meta P1 |
|---------|----------|---------|---------|
| Score UX médio (este audit) | 27.5/40 site, 34.7/40 plataforma | 32/40 site, 37/40 plataforma | 35/40 site, 38/40 plataforma |
| Lighthouse Accessibility | n/d | ≥90 | ≥95 |
| Contraste WCAG AA fails | múltiplos | 0 | 0 |
| Cores hardcoded em `/ikazin/` | ~12 | 0 | 0 |
| `motion` lib uso | 0 componentes | 5+ | 12+ |
| Time to interactive Dashboard | n/d | <3s | <2s |

---

## 9. Próximos passos imediatos

1. Aprovar este plano + responder as **7 decisões pendentes** (seção 6).
2. Validar com `/home` audit — confirmar se está em `/ikazin/` ou se precisa shadow page.
3. Começar P0.1 — aplicar tokens em BuildCard (refactor mais visível, 30min).
4. Validar antes/depois visualmente.
5. Seguir P0.2 → P0.10 sequencialmente.

Ver `docs/ui-ux-components-spec.md` para spec detalhada de cada componente novo.
