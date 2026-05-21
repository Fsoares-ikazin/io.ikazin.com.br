# IKAZIN.IO — Checklist do que falta entregar

**Última atualização:** 2026-05-21
**Branch atual:** `dev-front-ui-p0` (commits `34221057` P0 + `2a176457` P1 subset)
**Refs:** `docs/ui-ux-audit.md` · `docs/ui-ux-adaptation-plan.md` · `docs/ui-ux-components-spec.md` · `docs/ui-ux-benchmark.md`

Marca `[x]` ao concluir. Mantém esse arquivo como single-source-of-truth do que falta.

---

## 1. P1 restante (componentes que exigem browser test)

### 1.1 Mini-player sticky "Assistindo agora" — **~7h**
- [ ] Criar `apps/web/lib/ikazin/now-playing-context.tsx` (Context + Provider + hook `useNowPlaying`)
- [ ] Criar `apps/web/components/ikazin/ui/MiniPlayer.tsx` (sticky bottom-right desktop, full-width mobile)
- [ ] Hook BuildVideoPlayer no `onPause` → set NowPlaying state
- [ ] Hide MiniPlayer quando user está em `/build/[buildId]` mesmo do nowPlaying
- [ ] Botão maximize → `router.push('/build/{n}')` + clear state
- [ ] Reset cross-session (não persistir localStorage — decisão #3 do plan)
- [ ] Mount `<NowPlayingProvider>` em `IkazinProviders.tsx`
- [ ] **Test manual**: pausar build → navegar para /catalogo → MiniPlayer aparece → maximize → volta para player com seek correto
- Spec: `docs/ui-ux-components-spec.md` § 1.6

### 1.2 ⌘K Command Palette — **~5h**
- [ ] Criar `apps/web/components/ikazin/ui/IkazinSearch.tsx` usando `cmdk` (já instalado)
- [ ] Grupos: Builds (todos os 25), Blog (posts publicados), Navegação (Dashboard, Catálogo, Planos, Conta), Ações
- [ ] Hook global `useCmdK()` (atalho `Cmd/Ctrl + K`) — montar em `IkazinProviders.tsx`
- [ ] Index estático de builds (fetch + cache no client via SWR ou state)
- [ ] Esc fecha; setas navegam; Enter abre
- [ ] **Test manual**: ⌘K abre → digitar "build 5" → Enter abre `/build/5`
- Spec: `docs/ui-ux-components-spec.md` § 1.5

### 1.3 BuildCard hover progressivo — **~3h**
- [ ] Adicionar prop `shortDescription?: string`
- [ ] 2-nível: rest (atual) + hover-expanded (revela descrição + CTA delay 300ms)
- [ ] Wrap em `<motion.article variants={cardHover}>` (variant já existe em `motion.ts`)
- [ ] Keyboard nav: Tab focus = abre detalhes mesmo sem hover
- [ ] **Test manual**: hover em card 300ms → expande info; sai → recolhe
- Spec: `docs/ui-ux-components-spec.md` § 2.1

### 1.4 IkazinModal (Radix Dialog + motion) — **~4h**
- [ ] Criar `apps/web/components/ikazin/ui/IkazinModal.tsx` (Radix + motion variants `backdrop` + `modalContent`)
- [ ] Props: `open`, `onOpenChange`, `title`, `description?`, `children`, `footer?`, `size: sm|md|lg`, `closeOnBackdrop?`
- [ ] Aplicar em 2 callsites: confirmação plan downgrade (admin), build complete dialog
- [ ] **Test manual**: abrir/fechar, Esc fecha, focus trap funciona, backdrop blur OK
- Spec: `docs/ui-ux-components-spec.md` § 1.4

### 1.5 BuildVideoPlayer v2 — **~3h**
- [ ] Speed dropdown: indicador visual de seleção ativa (`background: color.primary.soft`)
- [ ] Hook `onPause` → set NowPlaying (dependência 1.1)
- [ ] Watermark IKAZIN com cor de tier
- [ ] Toast de erro de carregamento (`toast.error(copy.errors.videoLoadFailed)`)
- [ ] **Test manual**: pausar, trocar velocidade, simular erro de rede

### 1.6 MaterialsList v2 — **~2h**
- [ ] Skeleton enquanto carrega lista (substituir loading inline)
- [ ] Toast de erro em vez de inline (`toast.error(copy.errors.materialsDownloadFailed)` no catch)
- [ ] Tooltips com motion `fade` variant
- [ ] **Test manual**: clicar download, simular falha (DevTools offline)

### 1.7 HorizontalRow v2 — **~2h**
- [ ] Setas com motion variant (em vez de `group-hover:opacity-100` puro)
- [ ] Prop `loading?: boolean` + `skeletonCount?: number` → renderiza N `<BuildCardSkeleton inGrid>`
- [ ] **Test manual**: scroll touch mobile + setas desktop

### 1.8 Marketing refactor — extrair componentes — **~6h**
- [ ] `<TierCard>` extraído de `PlanosClient.tsx` (180+ linhas inline → componente)
- [ ] `<FeaturedPostCard>` extraído de `BlogClient.tsx` (160+ linhas)
- [ ] `<BuildListItem>` extraído de `PlanoDetailClient.tsx` (330+ linhas)
- [ ] `.btn-primary` CSS centralizado em `globals.css` (`@layer components`)
- [ ] **Test manual**: visual regression de `/planos`, `/blog`, `/planos/basic`

### 1.9 Shiki code blocks no blog — **~5h**
- [ ] `npm i shiki` (precisa instalar)
- [ ] `<CodeBlock language="scl">` wrapper com tema custom Ikazin (background `tokens.color.surfaceSunken`)
- [ ] Substituir code blocks hardcoded (`#0D1117, #161B22`) em `BlogPostClient.tsx`
- [ ] Code-split via dynamic import (~200KB bundle)
- [ ] Copy button no canto superior direito
- [ ] **Test manual**: artigo com snippet PLC renderizado

### 1.10 Plano/tier como identidade — **~3.5h** (depende backend)
- [ ] **Backend**: migration `004_max_tier_ever.sql` — coluna `ikazin_max_tier_ever` em `user.details`
- [ ] **Backend**: set ao upgrade (em `services/ikazin/access.py` `assign_ikazin_plan()`)
- [ ] **Frontend**: avatar ring colorido do `max_tier_ever` (componente `<TierAvatar>`)
- [ ] **Frontend**: badge "Membro {Tier}" no topbar
- [ ] **Frontend**: página `/conta` com stats (plano desde X, builds concluídos, horas estudadas)
- [ ] **Test manual**: simular upgrade Basic → Essentials → ring atualiza permanente

### 1.11 Layout v2 — page transitions — **~2h**
- [ ] Wrap `<main>` em `<motion.main variants={pageTransition}>` (variant em `motion.ts`)
- [ ] `<AnimatePresence mode="wait">` no layout
- [ ] Testar que não causa layout shift em first paint
- [ ] **Test manual**: navegar /dashboard → /catalogo → /build/1 sem flash

### 1.12 IkazinBadge usar em mais lugares — **~1h**
- [ ] `apps/web/app/orgs/[orgslug]/(ikazin)/build/[id]/page.tsx` linha ~280 — tier inline → `<IkazinBadge variant="tier">`
- [ ] Substituir todos status visuais ad-hoc do app do aluno por `<IkazinBadge variant="status">`

---

## 2. P2 (após primeiros 100 alunos)

### 2.1 Thumbnails com cor dominante extraída — **~8h**
- [ ] `npm i node-vibrant` (server-side, gerar cor dominante de cada thumb upload)
- [ ] Aplicar gradient `tokens.color.{dominant}` atrás do hero/card
- [ ] Cache cor extraída no backend (`ikazin_builds.thumbnail_dominant_color`)

### 2.2 Confete em milestone — **~4h**
- [ ] `react-confetti` (já instalado) — usar `<Confetti>` ao completar build
- [ ] Animação grande ao completar tier inteiro (`milestone` variant)
- [ ] Disable via `prefers-reduced-motion`

### 2.3 Modo compacto vs confortável — **~5h**
- [ ] Toggle no catálogo (estilo Gmail) — `localStorage.ikz_density`
- [ ] BuildCard variant: `compact` (sem thumbnail) vs `comfortable` (atual)

### 2.4 Personalização do dashboard — **~12h**
- [ ] Reordenar HorizontalRows por frequência de uso (analytics tracking)
- [ ] Endpoint `/api/v1/ikazin/dashboard/personalize`
- [ ] State client-side opcional para override manual

### 2.5 Mobile bottom navigation — **~6h**
- [ ] Componente `<MobileBottomNav>` (4-5 itens: Dashboard, Catálogo, Trilha, Conta)
- [ ] Esconder em desktop (>= md)
- [ ] Topbar mobile some quando bottom-nav está ativa

### 2.6 Service Worker / PWA — **~15h**
- [ ] `next-pwa` ou Workbox configurado
- [ ] Cache assets estáticos (CSS, JS chunks, fontes)
- [ ] Offline gracioso para conteúdo já visitado
- [ ] Manifest + ícones em diversos tamanhos

### 2.7 Admin LH redesign — **~6h**
- [ ] Plus Jakarta Sans aplicado em `apps/web/app/admin/layout.tsx` (30min)
- [ ] Emerald/zinc palette substituindo `white/10` (2-3h)
- [ ] Tab "Courses" do org detail — botão Edit + search inline (1-2h)
- [ ] Confirmação dialog antes de plan downgrade (1-2h)
- [ ] Breadcrumb navigation

---

## 3. Backend / infra (pré-beta)

Da seção "Bloqueios por ambiente" do `PLATFORM.md`:

- [ ] **HLS / player**: upload de segments em `ikazin/builds/{n}/hls/` no MinIO
- [ ] **Downloads**: configurar MinIO em `apps/api/.env` (`content_delivery=s3api` + credenciais) + upload .exe/.zip/.pdf reais
- [ ] **Lead magnet email**: SMTP em `apps/api/.env` (Zoho conforme `scope.md`)
- [ ] **Analytics**: criar projeto PostHog + setar `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] **Welcome link pós-compra**: integrar Stripe webhook → `POST /api/v1/ikazin/admin/activate`
- [ ] **Webhook handler**: criar endpoint que recebe Stripe (já tem checkout) → ativa plano automaticamente
- [ ] **Migration `004_max_tier_ever.sql`** (depende item 1.10)
- [ ] **Migration `005_user_recent_views.sql`**: tabela para tracking de personalização (item 2.4)

---

## 4. QA visual pré-beta — manual

Para cada bloco, validar manual em browser:

### 4.1 Desktop Chrome (1440x900)
- [ ] `/` (Landing) — hero, planos preview, blog preview
- [ ] `/planos` — 4 tier cards, premium plus, FAQ
- [ ] `/planos/basic` — outcomes sidebar, build list, CTA
- [ ] `/blog` — featured + grid + newsletter
- [ ] `/blog/[slug]` — article, code blocks, related posts
- [ ] `/auth/login` — form, error states
- [ ] `/dashboard` — saudação + ProgressCircle + RecommendationCard + 3 rows
- [ ] `/catalogo` — filtros, tier sections, locked cards
- [ ] `/build/1` — player, materiais, sidebar, próximo build, progress
- [ ] `/welcome` — wizard 3 steps + recomendação

### 4.2 Mobile (iPhone 12 — 390x844)
- [ ] Touch scroll horizontal nas rows
- [ ] Tap em card → navega
- [ ] StickyDownloadBar visível e funcional
- [ ] Filters mobile (catálogo)
- [ ] Header não corta texto

### 4.3 Dark mode validation
- [ ] Nenhuma tela tem flash branco em load
- [ ] `/orgs/{slug}/home` (org selector) usa dark
- [ ] Admin layout dark consistente

### 4.4 Lighthouse
- [ ] Performance ≥ 80 em `/dashboard`, `/catalogo`
- [ ] Accessibility ≥ 95 em todas
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 90 em marketing pages

---

## 5. Acessibilidade (WCAG AA)

- [x] ~~Contraste texto reprovado em `LandingClient`, `PlanosClient`~~ (P0 ✓)
- [x] ~~Contraste tier headers do catálogo~~ (P0 ✓)
- [x] ~~`text-zinc-500` empty message do HorizontalRow~~ (P0 ✓)
- [ ] **axe-core run**: rodar em `/dashboard`, `/catalogo`, `/build/1`, `/planos` — 0 violações críticas
- [ ] `prefers-reduced-motion` respeitado globalmente — wrapper `<LazyMotion>` ou check em motion variants
- [ ] Focus visible em `<details>` (FAQ planos), inputs newsletter, dropdown video speed
- [ ] Touch targets ≥ 44px em filter chips mobile (catálogo)
- [ ] Tier badge depende só de cor — adicionar ícone por tier (para color-blind)
- [ ] Alt text em todas imagens (BuildCard thumbnail, hero thumbnails)
- [ ] Test keyboard only em `/dashboard`, `/catalogo`, `/build/1`
- [ ] `aria-label` em ChevronLeft/Right do HorizontalRow (já tem? validar)
- [ ] Modal focus trap (item 1.4)

---

## 6. Performance

- [x] ~~Plus Jakarta + JetBrains Mono com `display: swap`~~ (Wave 2 ✓)
- [ ] Verify next/font preload está ativo nos fonts
- [ ] BuildCard thumbnails com `loading="lazy"` exceto primeiro do hero (`priority`)
- [ ] OG image `/api/og/blog/{slug}` cacheada (HTTP cache headers ou `unstable_cache`)
- [ ] Prefetch de `/build/[id]` em hover do BuildCard (`router.prefetch()` ou `<Link prefetch>`)
- [ ] hls.js importado só client-side (verificar import dynamic)
- [ ] shiki code-split (item 1.9)
- [ ] Service Worker (item 2.6)
- [ ] Image optimization em blog featured images — aspect-ratio container (evita CLS)
- [ ] Bundle analyzer rodado pra verificar peso de marketing pages

---

## 7. Tech debt

- [ ] **Marketing usa `ikz-lime`/`ikz-cyan`** — atualmente mitigado por CSS alias (P0.3 do plan). Refactor formal: substituir classes para emerald. ~6h.
- [ ] **CSS vars vs tokens.ts desconexão** — `tailwind.config.js` usa `hsl(var(--primary))` mas Ikazin usa hex em tokens.ts. Unificar fazendo Tailwind extend com `ikz.*` tokens. ~2h.
- [ ] **TIER_CONFIG legado em `constants.ts`** — marcado `@deprecated`, mas ainda importado em `dashboard/page.tsx` (já migrado para TIERS), `HeroContinueCard` antigo, `NextBuildCompactCard` antigo. Validar: rodar `grep -rn "TIER_CONFIG\|IKAZIN_DESIGN\|getTierForBuild" apps/web/` e remover referências. ~1h.
- [ ] **`react-hot-toast` E `sonner` coexistem no package.json** — escolher um (decisão: sonner) e remover o outro + callsites. ~30min.
- [ ] **`emoji-mart` força React peer 16-18** — uso `--legacy-peer-deps`. Avaliar substituto ou aceitar. Documentar.
- [ ] **Border radius múltiplos valores** (`rounded-xl`, `rounded-[18px]`, `rounded-[20px]`, `rounded-[24px]`) — padronizar 3 valores via `tokens.radius.{md,lg,xl}` e Tailwind extend. ~1h.
- [ ] **Tinybird offline em dev** — admin Analytics tab sem fallback. Adicionar empty state genérico. ~30min.
- [ ] **BuildCard hardcoded `rgba(16,185,129,0.4)` em badge #** — substituir por `tokens.color.primary.glow`/`soft` específicos. ~10min.

---

## 8. Validações antes de merge para `main`

Sequência obrigatória antes do PR ser mergeado:

- [ ] `cd apps/web && npx tsc --noEmit` — 0 erros
- [ ] `npm run lint` — apenas warnings tolerados
- [ ] `next build` localmente — sucesso
- [ ] Lighthouse `/dashboard` + `/catalogo` + `/build/1` em produção local (`next start`)
- [ ] axe-core run nas 4 telas principais
- [ ] Validação visual mobile real (Chrome DevTools device toolbar mínimo)
- [ ] Validação dark mode em todas telas
- [ ] Smoke test fluxo: login → /home → selecionar org → /dashboard → /catalogo → /build/1 → play → /materials download
- [ ] Smoke test mobile: mesmo fluxo

---

## 9. Decisões pendentes (precisam aprovação humana antes de implementar)

- [ ] **Avatar ring lógica detalhada** (item 1.10): backend nunca decrementa, mas e em refunds? Política precisa ser confirmada.
- [ ] **Mini-player mobile**: aparece sempre que tem build pausado? Ou só na mesma rota raiz? (Decisão #3 do plan: "só na mesma sessão" — confirma se quer mais granular.)
- [ ] **Empty state copy** (`copy.ts`): voz "engenheiro pra engenheiro" — revisar trimestralmente. Próxima revisão: 2026-08-21.
- [ ] **⌘K Search**: indexar apenas builds do plano do user, ou todos (com locked badge)?
- [ ] **Service Worker** (P2.6): adia ou implementa? Custo 15h.
- [ ] **Light mode opcional** (P2 ou nunca): decisão atual = nunca. Reavaliar se aparece demanda.
- [ ] **Shiki vs Prism**: Shiki recomendado (tema configurável Ikazin), mas Prism é mais leve. Avaliar bundle final.

---

## 10. Marcos por sprint

| Sprint | Objetivo principal | Items |
|--------|-------------------|-------|
| Atual (dev-front-ui-p0) | P0 + P1 subset | Aplicado: tokens, IkazinBadge, EmptyState, TierSection, Progress, Recommendation, Toast |
| Próximo (sprint 2) | P1 com browser test | 1.1 MiniPlayer, 1.2 ⌘K, 1.3 hover progressivo |
| Sprint 3 | P1 polish + backend deps | 1.4 Modal, 1.5 Video v2, 1.6 Materials v2, 1.7 Row v2, backend max_tier_ever |
| Sprint 4 | P1 conteúdo + identidade | 1.8 Marketing extract, 1.9 Shiki, 1.10 Avatar ring, 1.11 Page transitions |
| Sprint 5 (beta) | QA visual + acessibilidade + perf | Seções 4, 5, 6 deste checklist |
| Sprint 6+ | P2 conforme métricas | Items seção 2 |

---

## 11. Como atualizar esse documento

1. Ao concluir item, marca `[x]` em vez de `[ ]`.
2. Se descobrir novo trabalho, adiciona na seção correta com estimativa.
3. Se decidir não fazer item, prefixa título com `~~RISCADO~~` e adiciona motivo abaixo.
4. Atualize "Última atualização" no topo a cada sessão.
5. Mantém referências para arquivos/specs precisas (file:line quando aplicável).
