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
├── layout.tsx              # dark mode + Plus Jakarta Sans
├── dashboard/page.tsx      → /dashboard
├── catalogo/page.tsx       → /catalogo  (era /builds — conflito com LH resolvido)
├── build/[id]/page.tsx     → /build/[id]
└── welcome/page.tsx        → /welcome

apps/web/components/ikazin/ui/
├── BuildCard.tsx
└── HeroContinueCard.tsx

apps/web/lib/ikazin/
└── constants.ts            # IKAZIN_DESIGN, TIER_CONFIG, getTierForBuild()
```

### Backend
```
apps/api/src/routers/
├── ikazin_builds.py        # /api/v1/ikazin/builds
├── ikazin_progress.py      # /api/v1/ikazin/progress
└── ikazin_downloads.py     # /api/v1/ikazin/downloads

apps/api/src/schemas/
└── ikazin_build.py         # Pydantic schemas

apps/api/migrations/ikazin/
└── 001_initial.sql         # ikazin_builds, ikazin_progress_meta, ikazin_downloads
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
