# IKAZIN.IO — Auditoria UI/UX

**Data:** 2026-05-20
**Escopo:** Site público + plataforma do aluno + admin LH stock
**Stack auditada:** Next.js 16 + React 19 + Tailwind v4 + dark mode forçado
**Autor:** UX/UI Senior

---

## 0. Resumo executivo

A plataforma tem fundação sólida — responsividade quase perfeita, componentes encapsulados, identidade dark cohesiva. As três fragilidades sistêmicas são:

1. **Cores hardcoded fora do sistema de tokens** — `rgba()` inline e classes Tailwind dispersas (`text-zinc-400`, `border-amber-900/50`) impedem tema centralizado.
2. **Contraste WCAG AA reprovado** em texto secundário (`text-zinc-400`/`text-gray-500` em fundo `#0a0e0d`).
3. **Conflito de paleta entre site público e plataforma** — landing/planos/blog usam `ikz-lime`+`ikz-cyan`, dashboard/build/welcome usam `emerald`. Decisão arquitetural 2026-05-20: **emerald + zinc é a paleta autoritativa**. Site público precisa migrar (P0 do `ui-ux-adaptation-plan.md`).

**Score médio geral: 28/40 (70%)**

| Bloco | Telas auditadas | Score médio | Pior nota |
|-------|-----------------|-------------|-----------|
| Site público | 6 | 27/40 | Cores 2/5 |
| Plataforma aluno | 4 telas + 5 componentes | 30/40 | Animações 2/5 |
| Admin LH | 6 áreas | 6/10 identidade | Sem Plus Jakarta |

---

## 1. Critérios

Cada tela avaliada em 8 eixos, 1-5 cada (máx 40):

| Eixo | O que se mede |
|------|---------------|
| Hierarquia | Foco visual primário correto; H1>H2>conteúdo |
| Espaçamento | Padding/margin consistentes; ritmo vertical |
| Tipografia | Escala definida; pesos; line-height |
| Cores | Tokens centralizados; sem hex hardcoded; WCAG AA (≥4.5:1) |
| Responsividade | Breakpoints; mobile-first; max-width caps |
| Animações | Transitions 150-300ms; entrada de elementos |
| Componentes | Reuso; props flexíveis; sem duplicação |
| Performance | Imagens lazy; fontes display:swap; sem CLS |

---

## 2. Site público — auditoria por tela

### 2.1 Landing — `_components/marketing/LandingClient.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 4/5 | Headline 5xl/7xl claro; faltam micro-hierarquias em cards de stats |
| Espaçamento | 4/5 | py-20/py-28 consistente; grids podiam ser mais modulares |
| Tipografia | 3/5 | `font-black` em headlines OK; escala vertical body/h apertada (~1.25em) |
| Cores | 2/5 | Gradients hardcoded; `text-gray-500` em stats |
| Responsividade | 4/5 | Breakpoints OK; falta max-width em mobile |
| Animações | 5/5 | Hover translate + opacity 100-200ms — bem feito |
| Componentes | 3/5 | TierCard/CTA replicados inline; sem `.btn-primary` central |
| Performance | 3/5 | Logo `priority`; fonts sem `display:swap` |
| **Total** | **28/40** | |

**Problemas críticos (P0):**

- `LandingClient.tsx:370` — `text-xs text-gray-500` sobre `bg-ikz-surface` → contraste **~2.8:1** (FALHA WCAG AA).
  Recomendação: subir para `text-gray-300` (≥7:1).
- `LandingClient.tsx:356-357` — `background: 'radial-gradient(ellipse, rgba(239,68,68,0.04)...`. Cores hex/rgba fora dos tokens.
  Recomendação: usar `gradient.cardHover` ou criar token semântico para pain section.

**Problemas médios (P1):**

- `LandingClient.tsx:394` e `PlanosClient.tsx:169` — CSS de botão primário duplicado.
- Pain section badge usa `red-900/40 + red-950/20` — cor fora da paleta Ikazin.
- `BuildPreviewStrip` fade-right usa `from-ikz-bg` — pattern bom, manter.

---

### 2.2 Planos listagem — `_components/marketing/PlanosClient.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 5/5 | H1, subtítulo, grid 4-col, "Most Popular" badge bem posicionado |
| Espaçamento | 4/5 | pb-20/p-6 consistente |
| Tipografia | 4/5 | Preço text-4xl bom; line-height body herdado |
| Cores | 2/5 | `text-gray-500` linha 158 — contraste falha; amber-900/40 fora do sistema |
| Responsividade | 5/5 | md:grid-cols-2 lg:grid-cols-4; max-w-7xl |
| Animações | 5/5 | hover:-translate-y-1 + opacity bem aplicado |
| Componentes | 3/5 | TierCard inline 180+ linhas — extrair como componente |
| Performance | 4/5 | Sem imagens; sem form |
| **Total** | **27/40** | |

**P0:** mesmo contraste de `text-gray-500` em "one-time payment".
**P1:** extrair `<TierCard>`; FAQ `<details>` sem focus outline.

---

### 2.3 Plano individual — `_components/marketing/PlanoDetailClient.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 5/5 | Back link + h1 tagline + sidebar destacada |
| Espaçamento | 4/5 | py-16/py-12, sidebar lg:w-80 |
| Tipografia | 4/5 | Hierarquia clara; falta peso/medium em ênfases body |
| Cores | 3/5 | `plan.color` em 4 variantes — 3/4 não tokens; check icon hardcoded `text-ikz-lime` |
| Responsividade | 5/5 | lg:flex-row, mobile stack |
| Animações | 4/5 | hover:shadow-glow-lime-lg; falta focus visible |
| Componentes | 3/5 | Build list 330+ linhas inline; DemoVideo reutiliza bem |
| Performance | 4/5 | Video loop playsInline |
| **Total** | **29/40** | |

**P1:** Build tags inline — extrair `<BuildTag>`.
**P0 (conflito paleta):** todo este componente usa `ikz-lime/ikz-cyan` — precisa migrar para emerald no plano P0.

---

### 2.4 Blog listagem — `_components/marketing/BlogClient.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 4/5 | Hero + featured + grid 3-col bem ordenado |
| Espaçamento | 4/5 | py-16/py-12, gap-5 grid |
| Tipografia | 3/5 | `text-sm leading-relaxed` em body; sem theme line-height |
| Cores | 2/5 | tagColors drives/dt hardcoded em rgba (`rgba(168,85,247,0.12)`) |
| Responsividade | 5/5 | sm/lg breakpoints corretos |
| Animações | 4/5 | hover:border + shadow-glow OK |
| Componentes | 3/5 | Featured card + newsletter inline (160+/230+ linhas) |
| Performance | 3/5 | Images lazy; `/api/og/blog/${slug}` sem cache visível |
| **Total** | **25/40** | |

**P0:** `tagColors` em `BlogClient.tsx:42-47`:
```ts
drives: 'bg-[rgba(168,85,247,0.12)] text-purple-400',
dt:     'bg-[rgba(251,146,60,0.12)] text-orange-400',
```
Criar tokens `--ikz-drives` e `--ikz-dt` ou usar `tokens.color` semântico.

---

### 2.5 Artigo blog — `_components/marketing/BlogPostClient.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 4/5 | Back + h1 + excerpt + article markdown-like |
| Espaçamento | 4/5 | py-12/py-8, mb-5/mt-10 ritmo bom |
| Tipografia | 4/5 | h1-h3 clara; code mono presente |
| Cores | 2/5 | tagColors hardcoded; code block `#0D1117, #161B22` (GitHub colors) |
| Responsividade | 5/5 | max-w-3xl bom limite leitura |
| Animações | 3/5 | Sem hover em related posts |
| Componentes | 3/5 | `renderBlock()` switch 150+ linhas — refatorar |
| Performance | 2/5 | OG image sem cache; sem font preload |
| **Total** | **25/40** | |

**P0:** code block colors hardcoded — referenciar `tokens.color.surfaceSunken`.

---

### 2.6 Home (`/home`) — `app/orgs/[orgslug]/home/home.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 5/5 | Logo + h1 + lista de orgs |
| Espaçamento | 4/5 | py-12, mb-10 ritmo OK |
| Tipografia | 4/5 | h1 + sm body |
| Cores | 4/5 | **VIOLAÇÃO DARK MODE**: `bg-white text-gray-900` linha 49 |
| Responsividade | 5/5 | max-w-md cap; mobile OK |
| Animações | 3/5 | hover:shadow-lg + bg-black/[0.04] sutil |
| Componentes | 4/5 | OrgCard inline 50 linhas; reutiliza UserAvatar |
| Performance | 5/5 | SWR + lazy images |
| **Total** | **31/40** | |

**P0:** **`HomeClient.tsx:49` rompe o dark mode forçado** — usar `tokens.color.surface` + `tokens.color.text.primary`.

---

### 2.7 Tabela consolidada site público

| Tela | H | E | T | C | R | A | Co | P | Total/40 |
|------|---|---|---|---|---|---|----|---|----------|
| Landing | 4 | 4 | 3 | 2 | 4 | 5 | 3 | 3 | **28** |
| Planos | 5 | 4 | 4 | 2 | 5 | 5 | 3 | 4 | **27** |
| Plano [slug] | 5 | 4 | 4 | 3 | 5 | 4 | 3 | 4 | **29** |
| Blog | 4 | 4 | 3 | 2 | 5 | 4 | 3 | 3 | **25** |
| Blog [slug] | 4 | 4 | 4 | 2 | 5 | 3 | 3 | 2 | **25** |
| Home | 5 | 4 | 4 | 4 | 5 | 3 | 4 | 5 | **31** |
| **Média** | 4.5 | 4.0 | 3.7 | 2.5 | 4.8 | 4.0 | 3.2 | 3.5 | **27.5** |

---

## 3. Plataforma do aluno — auditoria por tela

### 3.1 Dashboard — `app/orgs/[orgslug]/(ikazin)/dashboard/page.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 4/5 | HeroContinueCard destaca; falta nome do user em H1 (personalização) |
| Espaçamento | 5/5 | gap-8 entre seções; padding consistente |
| Tipografia | 4/5 | h1 2xl/3xl; falta diferenciação em labels |
| Cores | 3/5 | `#0a0e0d` hardcoded em vez de `bg-ikz-bg`; `text-zinc-400` contraste limítrofe |
| Responsividade | 5/5 | grid lg:grid-cols-[1.6fr_0.8fr] |
| Animações | 2/5 | Skeleton `animate-pulse` básico; sem stagger entrada de rows |
| Componentes | 4/5 | HeroContinueCard + HorizontalRow + BuildCard reutilizados bem |
| Performance | 5/5 | Skeleton states; fetch async |
| **Total** | **32/40** | |

**P0:** `dashboard/page.tsx:173, 188, 203` — `#0a0e0d` hardcoded três vezes. Substituir por classe Tailwind ou CSS var.
**P1:** RowSkeleton não tem hover state — usuário pode tentar clicar antes do carregamento.

---

### 3.2 Catálogo — `app/orgs/[orgslug]/(ikazin)/catalogo/page.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 5/5 | H1, descritivo, filtros, grid por tier — excelente |
| Espaçamento | 4/5 | gap-1.5 em chips muito apertado |
| Tipografia | 5/5 | Uppercase headers de tier bem feito |
| Cores | 2/5 | tier headers hardcoded `text-zinc-400`, `text-blue-400`, `text-orange-400` |
| Responsividade | 5/5 | 1/2/3/4 cols progressivo |
| Animações | 1/5 | **Nenhuma animação em grid, filtros ou tier headers** |
| Componentes | 5/5 | BuildCard encapsulado bem |
| Performance | 5/5 | useMemo filtered/grouped |
| **Total** | **32/40** | |

**P0:** `catalogo/page.tsx:35-40` — tier text colors hardcoded fora do sistema. **Migrar para `tokens.tiers.X.textColor`** (já tem contraste WCAG validado em tokens.ts 2.0).
**P1:** filter buttons sem `hover:scale-105`; grid sem stagger entrada.

---

### 3.3 Build detail — `app/orgs/[orgslug]/(ikazin)/build/[id]/page.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 5/5 | h1 + tier badge + descrição + progress + materiais |
| Espaçamento | 5/5 | gap-6, p-5 em cards |
| Tipografia | 5/5 | h1 sm:text-3xl, leading-7 |
| Cores | 4/5 | Tier badges dynamic; fallback `#141a18` inline linha 280 |
| Responsividade | 5/5 | lg:grid + sticky video top-16 |
| Animações | 3/5 | BuildVideoPlayer transitions OK; NextBuildCompactCard não anima |
| Componentes | 5/5 | Player + Materials + NextBuild bem separados |
| Performance | 5/5 | Skeleton + sticky download bar mobile |
| **Total** | **37/40** | |

**P1:** Progress bar sem easing definido (`transition-all` genérico). Usar `tokens.shadow.glowTier(tier)` em milestones.

---

### 3.4 Welcome / Wizard — `app/orgs/[orgslug]/(ikazin)/welcome/page.tsx`

| Eixo | Nota | Notas |
|------|------|-------|
| Hierarquia | 5/5 | Step dots + grid 3 cols opções |
| Espaçamento | 5/5 | md:2 / xl:3 distribuído bem |
| Tipografia | 5/5 | h1 3xl, opções base, descriptions small |
| Cores | 5/5 | Emerald + zinc consistente |
| Responsividade | 5/5 | mx-auto max-w-5xl |
| Animações | 3/5 | Step dots animate-pulse; cards sem hover |
| Componentes | 5/5 | StepCard encapsulado |
| Performance | 5/5 | Async recomendação |
| **Total** | **38/40** | |

**P1:** StepCard sem hover scale/shadow; `Analisando...` sem `Loader2 animate-spin`.

---

### 3.5 Tabela consolidada plataforma aluno

| Tela | H | E | T | C | R | A | Co | P | Total/40 |
|------|---|---|---|---|---|---|----|---|----------|
| Dashboard | 4 | 5 | 4 | 3 | 5 | 2 | 4 | 5 | **32** |
| Catálogo | 5 | 4 | 5 | 2 | 5 | 1 | 5 | 5 | **32** |
| Build [id] | 5 | 5 | 5 | 4 | 5 | 3 | 5 | 5 | **37** |
| Welcome | 5 | 5 | 5 | 5 | 5 | 3 | 5 | 5 | **38** |
| **Média** | 4.75 | 4.75 | 4.75 | 3.5 | 5.0 | 2.25 | 4.75 | 5.0 | **34.7** |

---

## 4. Auditoria de componentes ikazin

8 componentes em `apps/web/components/ikazin/ui/`:

| # | Componente | Hover | Animação | Cor source | Score |
|---|-----------|-------|----------|-----------|-------|
| 1 | BuildCard | ✓ scale + border + shadow | transition-all 150ms | Tailwind + TIER_BADGE local | 39/40 |
| 2 | HeroContinueCard | ✓ play scale | transition progress bar | inline gradients rgba | 38/40 |
| 3 | HorizontalRow | ✓ scroll arrows opacity | scroll smooth + snap | Tailwind | **40/40** ⭐ |
| 4 | BuildVideoPlayer | ✓ speed menu | transition-colors | Tailwind | 37/40 |
| 5 | NextBuildCompactCard | parcial | transition-colors | **inline** `style.borderColor: tier.color+55` | 32/40 |
| 6 | OnboardingBanner | — | nenhuma | **inline** rgba gradients | 28/40 |
| 7 | MaterialsList | ✓ tooltip | nenhuma explícita | Tailwind | 36/40 |
| 8 | IkazinAnalyticsProvider | n/a | n/a | n/a (no UI) | n/a |

**Duplicação crítica detectada:** `TIER_BADGE` está hardcoded em `BuildCard.tsx` E em `constants.ts`. Trocar uma cor de tier hoje quebra em dois lugares. Solução: tokens.ts já consolida via `TIERS[t]`.

---

## 5. Admin LH stock — auditoria superficial

| Tela | Path | Identidade Ikazin? | Crítico p/ operador |
|------|------|-------------------|---------------------|
| Login | `/admin/login` | Não — preto + branco genérico | Baixo |
| Top bar | `AdminLeftMenu.tsx` | Parcial — Phosphor icons OK | Médio (sem breadcrumb) |
| Orgs list | `/admin/(dashboard)/organizations` | Parcial — emerald em 1 lugar | Médio (sort/filtro OK) |
| Org detail | `/admin/.../[orgId]` | Não — multi-color badges | **Alto** (sem edit em Courses) |
| Users list | `/admin/.../users` | Parcial | Baixo |
| Analytics | `/admin/.../analytics` | Não | Baixo (Tinybird-dependent) |

**Identidade score:** **6/10**. Dark mode + emerald em 2 pontos. Falta Plus Jakarta Sans, falta token Ikazin unificado.

**Recomendação:** customização superficial. Foco em:
1. Plus Jakarta Sans no admin layout (30min).
2. Tab "Courses" do Org detail — adicionar Edit button + search (1-2h).
3. Confirmação antes de plan downgrade (1-2h).

Deixar 100% stock: API endpoints, login flow, user permissions, Tinybird config.

---

## 6. Problemas críticos consolidados (P0)

### P0.1 — Cores hardcoded fora de `lib/ikazin/tokens.ts`

| Arquivo | Linha | Problema | Fix |
|---------|-------|----------|-----|
| `LandingClient.tsx` | 356-357 | radial-gradient `rgba(239,68,68,0.04)` | criar token `gradient.painSection` |
| `BlogClient.tsx` | 42-47 | tagColors rgba hardcoded | tokens `color.tagDrives`, `color.tagDt` |
| `BlogPostClient.tsx` | 103-108 | code block `#0D1117, #161B22` | `tokens.color.surfaceSunken` |
| `dashboard/page.tsx` | 173, 188, 203 | `#0a0e0d` 3x | classe `bg-ikz-bg` (extend Tailwind) |
| `catalogo/page.tsx` | 35-40 | tier text-colors hardcoded | `tokens.tiers[t].textColor` |
| `BuildCard.tsx` | TIER_BADGE | objeto local duplicado | import de `tokens.ts` |
| `NextBuildCompactCard.tsx` | 44-47 | inline style `tier.color+55` | manter mas via `tokens.tiers[t].bgSoft` |
| `HeroContinueCard.tsx` | 57, 121 | gradientes inline rgba | `tokens.gradient.heroOverlay` |
| `OnboardingBanner.tsx` | 14 | rgba inline | `tokens.gradient.onboarding` |

### P0.2 — Contraste WCAG AA reprovado

| Local | Combinação | Contraste atual | Min AA | Fix |
|-------|-----------|-----------------|--------|-----|
| `LandingClient.tsx:370` | `text-gray-500` em `bg-ikz-surface` | ~2.8:1 | 4.5:1 | `text-gray-300` |
| `PlanosClient.tsx:158` | mesmo | ~2.8:1 | 4.5:1 | `text-gray-300` |
| `catalogo/page.tsx:35` (tier basic header) | `text-zinc-400` em `#0a0e0d` | ~2.5:1 | 4.5:1 | `tokens.tiers.basic.textColor` |
| `BuildCard.tsx` (clock icon row) | `text-[11px] text-zinc-400` | ~2.8:1 + texto pequeno | 4.5:1 | `text-zinc-300` |
| `HorizontalRow` empty message | `text-zinc-500` | ~1.8:1 | 4.5:1 | `text-zinc-400` ou subir |

### P0.3 — Violação de dark mode forçado

- `apps/web/app/orgs/[orgslug]/home/home.tsx:49` — `bg-white text-gray-900`. **Quebra o tema dark em uma tela LH-stock visível ao usuário Ikazin.** Esta tela é onde o user escolhe a org após login.

### P0.4 — Conflito de paleta site público

Todas as marketing pages (`_components/marketing/*`) usam `ikz-lime`/`ikz-cyan`/`shadow-glow-lime-lg`. Decisão atual: **migrar para emerald**. Isto significa refactor de classes Tailwind em:
- `LandingClient.tsx`
- `PlanosClient.tsx`
- `PlanoDetailClient.tsx`
- `BlogClient.tsx`
- `BlogPostClient.tsx`
- CSS globals (vars `--ikz-lime`, `--ikz-cyan` viram aliases para emerald-500 ou são removidas)

---

## 7. Problemas médios consolidados (P1)

| # | Onde | Problema | Recomendação |
|---|------|----------|--------------|
| 1 | Vários (Landing, Planos) | `.btn-primary` CSS duplicado | Criar classe `@layer components { .btn-primary }` em globals |
| 2 | TierCard, FeaturedPostCard, BuildListItem | inline 150-200 linhas | Extrair componentes |
| 3 | `app/layout.tsx` | Sem `display: swap` em fonts | next/font + display=swap |
| 4 | Catálogo filters | Sem hover transform | `hover:scale-105 transition-transform` |
| 5 | Welcome StepCard | Sem hover feedback | `group hover:shadow-lg` |
| 6 | Welcome submitting | Sem spinner visual | `<Loader2 className="animate-spin" />` |
| 7 | Build detail progress | `transition-all` genérico | `tokens.motion.progressBar` |
| 8 | NextBuildCompactCard | Não anima emphasize | usar `cardHover` variant |
| 9 | RowSkeleton dashboard | Sem `group-hover` | adicionar consistência |
| 10 | renderBlock() em blog | switch 150+ linhas | extrair `<BlogBlock type=... />` |

---

## 8. Problemas baixos (P2)

- Border radius inconsistente: `rounded-xl`, `rounded-[18px]`, `rounded-[20px]`, `rounded-[24px]` — padronizar 3 valores (`tokens.radius.md/lg/xl`).
- Skeletons mostram contagem fixa (4 items) — calcular por breakpoint.
- Empty states sem voz de produto — Dashboard sem next-step para usuário sem plano.
- Tooltips MaterialsList sem fade animation.
- Aspect ratio ausente em featured images do blog → CLS potencial.
- `prefers-reduced-motion` não respeitado.
- Focus outline ausente em `<details>` e form inputs.
- Plus Jakarta Sans não é forçado via Tailwind theme — só via global CSS.

---

## 9. Tech debt registrada

- **CSS variables vs `IKAZIN_DESIGN` desconexão** — `tailwind.config.js` define `hsl(var(--primary))` mas Ikazin usa hex em `constants.ts`. Tokens 2.0 resolve, mas componentes ainda usam classes Tailwind tradicionais (`emerald-500`) em vez de CSS vars.
- **`motion` 12.34.3 instalado mas nunca usado.** `motion.ts` 2.0 fornece variantes prontas — aplicar em P1 quando refatorar componentes.
- **Tinybird Analytics pode estar offline em dev** — admin Analytics tab quebra sem fallback visual.
- **Lead magnet, downloads, video** dependem de MinIO/SMTP configurados (ver `PLATFORM.md` Bloqueios) — UI mostra 503 cru em alguns paths.

---

## 10. Acessibilidade — checklist

| Item | Status | Onde |
|------|--------|------|
| Contraste texto ≥4.5:1 (AA) | ✗ Falha múltipla | Ver P0.2 |
| `prefers-reduced-motion` | ✗ Não implementado | Global — adicionar `<LazyMotion>` wrapper |
| Focus visible em interativos | ⚠ Parcial | `<details>`, inputs faltando |
| Alt text em imagens | ✓ OK na maioria | Verificar BuildCard thumbnails |
| Labels em forms | ✓ OK | Newsletter, login |
| Heading order (h1→h2→h3) | ✓ OK | Páginas auditadas seguem ordem |
| Color-only meaning | ⚠ Tier badges dependem só de cor | Adicionar ícone por tier |
| Touch target ≥44px mobile | ✓ Maioria | Verificar filter chips compactos |

---

## 11. Performance — sinais observados

- Fonts sem `display: swap` → FOIT possível.
- OG images `/api/og/blog/${slug}` sem cache visível → potential N+1.
- Code blocks no blog inline render — sem lazy load.
- BuildVideoPlayer usa hls.js dinâmico — bom; verificar se importa só em client.
- SWR no Home — bom.
- Sem Service Worker — OK para alpha.
- Sem prefetch evidente em Link para `/build/[id]` — adicionar `prefetch={true}` em BuildCard.

---

## 12. Tabela final consolidada — todas as áreas

| Área | Score/40 | % | Cor pior eixo |
|------|----------|---|---------------|
| Landing | 28 | 70% | Cores |
| Planos | 27 | 68% | Cores |
| Plano [slug] | 29 | 73% | Cores |
| Blog | 25 | 63% | Cores |
| Blog [slug] | 25 | 63% | Cores |
| Home (orgs) | 31 | 78% | Animações |
| Dashboard | 32 | 80% | Animações |
| Catálogo | 32 | 80% | Animações |
| Build [id] | 37 | 93% | Animações |
| Welcome | 38 | 95% | Animações |
| Admin (identidade) | 6/10 | 60% | Tipografia |
| **Média plataforma** | **29.4/40** | **73%** | — |

---

## 13. Próximos passos

Ver `docs/ui-ux-adaptation-plan.md` para roadmap executável P0/P1/P2.
Ver `docs/ui-ux-components-spec.md` para spec dos componentes novos/refatorados.
Ver `docs/ui-ux-benchmark.md` para padrões Netflix/Spotify/Linear aplicáveis.
Ver `apps/web/lib/ikazin/tokens.ts` para Design System 2.0.
Ver `apps/web/lib/ikazin/motion.ts` para motion vocabulary.
