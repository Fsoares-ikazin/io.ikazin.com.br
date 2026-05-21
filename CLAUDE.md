# CLAUDE.md — Contrato Arquitetural Ikazin.io

Leia este arquivo no início de cada sessão. Define as regras invioláveis para
customizações da plataforma IKAZIN.IO sobre o base LearnHouse.

## Produto

**io.ikazin.com.br** — plataforma de curso técnico PLC + Digital Twin Siemens
- 25 builds numerados: Basic 1-8 / Essentials 9-13 / Advanced 14-18 / Premium 19-25
- Cada build: vídeo Vimeo + arquivo .exe + projeto TIA Portal + PDF guia
- Público: engenheiros industriais brasileiros
- UX: experiência Netflix, dark mode forçado

## Stack

| Camada | Tech |
|--------|------|
| Frontend | Next.js 16.2.4 + React 19, TypeScript, Tailwind |
| Backend | FastAPI 0.135.3, Python 3.14.3, SQLModel + Pydantic v2 |
| DB | PostgreSQL 16 (pgvector) |
| Cache | Redis 8 |
| Base | LearnHouse 1.1.4 |

## Regras invioláveis

### 1. Isolamento total
- **NUNCA** modificar arquivos fora de:
  - `apps/web/app/orgs/[orgslug]/(ikazin)/`  ← proxy LH requer esta localização
  - `apps/web/components/ikazin/`
  - `apps/web/lib/ikazin/`
  - `apps/api/src/routers/ikazin_*.py`
  - `apps/api/src/schemas/ikazin_*.py`
  - `apps/api/migrations/ikazin/`
  - `PLATFORM.md`, `CLAUDE.md`

### 2. Banco de dados
- Tabelas Ikazin: sempre prefixo `ikazin_`
- Jamais alterar tabelas LearnHouse existentes
- Migrations são arquivos SQL manuais em `migrations/ikazin/`

### 3. Autenticação
- Reutilizar 100% o sistema de auth do LearnHouse
- `get_current_user` do LearnHouse para todos os endpoints Ikazin
- Zero sistema de auth novo

### 4. Conflitos
- Se encontrar conflito com código existente: **PARAR e reportar**
- Não resolver conflitos por conta — sempre consultar arquiteto

### 5. Endpoints API
- Todos sob `/api/v1/ikazin/` (prefix no router.py)
- Router registrado no final de `src/router.py` após `# Builds Routes`

## Design tokens

```ts
bg: '#0a0e0d'        // zinc-950
surface: '#141a18'
primary: '#10b981'   // emerald-500
primaryHover: '#059669'
text: '#f4f4f5'
textMuted: '#71717a'
radius: '12px'
font: 'Plus Jakarta Sans'
darkMode: forçado (sem toggle)
```

## Tiers dos builds

| Tier | Builds | Cor |
|------|--------|-----|
| Basic | 1–8 | `#6366f1` |
| Essentials | 9–13 | `#f59e0b` |
| Advanced | 14–18 | `#f97316` |
| Premium | 19–25 | `#10b981` |

## Arquivos principais

- `apps/web/app/orgs/[orgslug]/(ikazin)/layout.tsx` — dark mode + Plus Jakarta Sans
- `apps/web/lib/ikazin/constants.ts` — tokens, tiers, helpers
- `apps/web/components/ikazin/ui/BuildCard.tsx` — card de build
- `apps/web/components/ikazin/ui/HeroContinueCard.tsx` — hero "continuar"
- `apps/api/src/schemas/ikazin_build.py` — schemas Pydantic
- `apps/api/migrations/ikazin/001_initial.sql` — schema SQL inicial

## Decisões arquiteturais registradas

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-05-20 | Páginas em `orgs/[orgslug]/(ikazin)/` | `proxy.ts` reescreve todos paths para `/orgs/{slug}/path` |
| 2026-05-20 | URL `/catalogo` (não `/builds`) | `/builds` já existe no LH — conflito de path Next.js |
| 2026-05-20 | Vídeo via `MinIO + HLS single bitrate` | Lançamento rápido sem custo de Vimeo/Stream |
| 2026-05-20 | **Paleta autoritativa: Emerald + Zinc** (não lime+cyan) | Código atual usa emerald — decisão de manter para evitar refactor. `docs/brand-dna.md` (lime+cyan) fica deprecated até reavaliação. Fonte da verdade: `apps/web/lib/ikazin/tokens.ts`. |
| 2026-05-20 | **Tipografia: Plus Jakarta Sans + JetBrains Mono** | Jakarta para UI/headlines, JetBrains Mono para code/specs técnicas (PLC, snippets de blog). |
| 2026-05-20 | **Design System 2.0 vive em `lib/ikazin/tokens.ts`** | Substitui `constants.ts` como fonte de verdade. Inclui tier text-colors com contraste WCAG AA. |
| 2026-05-20 | **Toast: `sonner` (lib externa)** | ~6KB gzip, stack/swipe/promise nativos. Estilizar via tokens. |
| 2026-05-20 | **Modal: Radix Dialog + wrapper `<IkazinModal>`** | A11y grátis (focus trap, ARIA, scroll lock). |
| 2026-05-20 | **MiniPlayer: state em React Context (não persistido)** | Sem hydration mismatch. Reset on tab close. |
| 2026-05-20 | **Bottom nav mobile fica em P2** | Sem analytics real, decisão de posicionamento vira chute. |
| 2026-05-20 | **Avatar ring = maior tier histórico (`ikazin_max_tier_ever`)** | Progresso permanente. Backend nunca decrementa. |
| 2026-05-20 | **Light mode: nunca** | Dark forçado é regra. -40% CSS, foco. |
| 2026-05-20 | **Copy centralizado em `apps/web/lib/ikazin/copy.ts`** | Empty states + saudações + narratives. Voz "engenheiro pra engenheiro". |

> **Nota sobre `docs/brand-dna.md`** — arquivo descreve paleta lime+cyan+slate associada ao novo logo 3D (2026-04-25). Decisão atual: **paleta brand-dna fica deprecated**. Se logo 3D entrar em produção e exigir lime+cyan, abrir RFC explícita antes de mexer em tokens. Site público (`_components/marketing/*`) atualmente usa `ikz-lime`/`ikz-cyan` — listado como P0 de migração no `docs/ui-ux-adaptation-plan.md`.

## Para subir o ambiente

Ver `PLATFORM.md` para comandos completos.

Resumo rápido:
```bash
docker compose -f .learnhouse/docker-compose.dev.yml up -d
cd apps/api && uv run python app.py      # porta 1338
cd apps/web && next dev --turbopack      # porta 3000
```
