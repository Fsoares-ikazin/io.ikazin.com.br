# PLATFORM.md — Ikazin.io Dev Baseline

## Commit baseline
- Hash: `6a213f6583d74d9cb728b8fd09d7fb59194101d1`
- Branch: `dev-front`
- Date: 2026-05-20
- LearnHouse version: 1.1.4 (Next.js 16.2.4, FastAPI 0.135.3, Python 3.14.3)

## Serviços dev

| Serviço | Porta | Comando |
|---------|-------|---------|
| Frontend (Next.js) | 3000 | `next dev --turbopack` |
| Backend (FastAPI) | 1338 | `uv run python app.py` |
| Collab (WebSocket) | 4000 | `tsx watch src/index.ts` |
| PostgreSQL | 5432 | Docker `learnhouse-db-dev` |
| Redis | 6379 | Docker `learnhouse-redis-dev` |

## Subir ambiente local

```bash
# 1. DB + Redis
docker compose -f .learnhouse/docker-compose.dev.yml up -d

# 2. API (terminal 1)
cd apps/api && uv run python app.py

# 3. Web (terminal 2)
cd apps/web && next dev --turbopack

# 4. Collab (terminal 3 — opcional)
cd apps/collab && tsx watch src/index.ts
```

Ou via CLI (interativo):
```bash
npx learnhouse dev
```

## Regras de mitigação alpha

1. **Nunca modificar** arquivos fora de `/ikazin/` e `/migrations/ikazin/`
2. **Tabelas** prefixadas com `ikazin_` — jamais alterar tabelas LearnHouse
3. **Auth** reutiliza 100% do LearnHouse — zero sistema novo
4. **Conflito com código existente** → PARAR e reportar ao arquiteto
5. **Migrations** ikazin são manuais (`psql $DB < migrations/ikazin/001_initial.sql`)
6. **Variáveis de ambiente** novas só em `apps/api/.env` (nunca commitar)

## Estrutura Ikazin criada

### Nota arquitetural — proxy LearnHouse
`proxy.ts` reescreve todos os paths não-padrão para `/orgs/{slug}/path`.
Por isso as páginas Ikazin vivem em `orgs/[orgslug]/(ikazin)/` (adição, sem modificar arquivos existentes).
URLs públicas continuam sem o prefixo `/orgs/default/`.

### Frontend
```
apps/web/app/orgs/[orgslug]/(ikazin)/
├── layout.tsx              # dark mode + Plus Jakarta Sans + analytics
├── dashboard/page.tsx      → /dashboard
├── catalogo/page.tsx       → /catalogo  (era /builds — conflito com LH resolvido)
├── build/[id]/page.tsx     → /build/[id]  (player HLS + materiais + progresso)
├── welcome/page.tsx        → /welcome    (wizard 3 steps → POST /ikazin/recommend)
└── admin/page.tsx          → /admin      (superadmin: atribuir plano a usuário)

apps/web/components/ikazin/ui/
├── BuildCard.tsx
├── BuildVideoPlayer.tsx    # hls.js, resume, progress tracking, speed selector
├── HeroContinueCard.tsx
├── HorizontalRow.tsx       # Netflix-style horizontal scroll
├── MaterialsList.tsx       # download real via presigned URL quando available=true
├── NextBuildCompactCard.tsx
├── OnboardingBanner.tsx
└── IkazinAnalyticsProvider.tsx

apps/web/lib/ikazin/
├── constants.ts            # IKAZIN_DESIGN, TIER_CONFIG, getTierForBuild()
└── analytics.ts            # PostHog wrapper
```

### Backend
```
apps/api/src/routers/
├── ikazin_builds.py        # /api/v1/ikazin/builds  + HLS proxy
├── ikazin_progress.py      # /api/v1/ikazin/progress  (upsert + complete)
├── ikazin_downloads.py     # /api/v1/ikazin/downloads (log + presigned URL)
├── ikazin_dashboard.py     # /api/v1/ikazin/dashboard
├── ikazin_leads.py         # /api/v1/ikazin/lead-magnet
├── ikazin_recommendation.py# /api/v1/ikazin/recommend (GET + POST wizard)
└── ikazin_admin.py         # /api/v1/ikazin/admin/activate + /plan

apps/api/src/services/ikazin/
├── builds.py               # plan tier logic, build serialization, dashboard
├── recommendation.py       # recommend_build() pure function
└── access.py               # assign_ikazin_plan, resolve_user, welcome_link

apps/api/src/schemas/
└── ikazin_build.py         # Pydantic schemas

apps/api/migrations/ikazin/
├── 001_initial.sql         # cria tabelas com coluna `number` (legado)
├── 002_seed_builds.sql     # renomeia number→build_number, add tags, seed 25 builds
└── 003_progress_resume.sql # add completed, completed_at, last_watched_at
```

### Aplicar migrations (ordem obrigatória)
```bash
psql $DB_URL < migrations/ikazin/001_initial.sql
psql $DB_URL < migrations/ikazin/002_seed_builds.sql
psql $DB_URL < migrations/ikazin/003_progress_resume.sql
```

## Video baseline

Ikazin usará `MinIO/S3-compatible + HLS single bitrate` para lançamento.

- Storage convention:
  - `ikazin/builds/{build_number}/source/master.mp4`
  - `ikazin/builds/{build_number}/hls/index.m3u8`
  - `ikazin/builds/{build_number}/hls/segment_000.ts`
- Playback:
  - Frontend usa `hls.js` fora do Safari
  - Safari usa HLS nativo
- Security:
  - Bucket privado
  - Backend FastAPI autentica o usuário e faz proxy de manifesto/segmentos em `/api/v1/ikazin/builds/{id}/hls/...`
- Progress:
  - `GET /api/v1/ikazin/builds/{id}/resume`
  - `POST /api/v1/ikazin/progress`
  - `PUT /api/v1/ikazin/progress/{id}/complete`

## Bloqueios por ambiente (pré-lançamento)

| Bloqueio | Detalhe | O que falta |
|---------|---------|------------|
| **HLS / player** | `playback_url` retorna `null` se não houver assets no bucket | Fazer upload dos HLS segments em `ikazin/builds/{n}/hls/` no MinIO |
| **Downloads** | Retorna 503 se `content_delivery != "s3api"` | Configurar MinIO em `apps/api/.env` + upload dos arquivos .exe/.zip/.pdf |
| **Lead magnet email** | Retorna 503 se SMTP não configurado | Preencher SMTP em `apps/api/.env` |
| **Analytics** | `track()` silencioso sem `NEXT_PUBLIC_POSTHOG_KEY` | Criar projeto PostHog e setar env var |
| **Welcome link pós-compra** | Retorna URL direta `/orgs/{slug}/welcome` (sem magic token) | Integrar com gateway de pagamento para acionar `POST /api/v1/ikazin/admin/activate` |
| **Atribuição de plano** | Só via API superadmin (`/admin/activate`) ou UI em `/admin` | Integrar Hotmart/Stripe webhook → chamar endpoint de ativação |

## Fluxo de ativação pós-pagamento (estrutura pronta)

```
Webhook pagamento → POST /api/v1/ikazin/admin/activate
Body: { email: "user@email.com", plan: "essentials", source: "hotmart" }
Resultado: user.details["ikazin_plan"] = "essentials"
Dashboard libera builds automaticamente na próxima requisição
```

A URL de boas-vindas pode ser enviada por email manualmente ou via automação:
`POST /activate` com `issue_welcome_link: true, org_slug: "default"` retorna a URL.
