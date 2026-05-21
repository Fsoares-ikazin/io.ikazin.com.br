# Ikazin Launch Blockers

Estado consolidado em `2026-05-21`.

Este arquivo resume apenas o que ainda bloqueia pré-beta/lançamento, em ordem prática.

## 1. Blockers operacionais

### P0 — bloqueia funcionamento real

- **Publicar HLS real no bucket**
  - Falta subir ao menos 1 build em `ikazin/builds/{build_number}/hls/`.
  - Sem isso, `/build/{id}` cai em placeholder e o fluxo `play` não homologa.
  - Base pronta: `publish_build_hls.sh`, `playback_status`, `playback_message`.

- **Configurar MinIO/S3 no ambiente real**
  - Falta preencher `apps/api/.env` com:
    - `LEARNHOUSE_CONTENT_DELIVERY_TYPE=s3api`
    - `LEARNHOUSE_S3_API_BUCKET_NAME`
    - `LEARNHOUSE_S3_API_ENDPOINT_URL`
    - `LEARNHOUSE_S3_API_ACCESS_KEY_ID`
    - `LEARNHOUSE_S3_API_SECRET_ACCESS_KEY`
    - `LEARNHOUSE_S3_API_REGION_NAME`
  - Sem isso, HLS e downloads retornam `503`.

- **Subir arquivos reais de material**
  - Falta upload de `.exe`, `.zip`, `.pdf` reais apontados pelos `file_key` dos builds.
  - A API já faz proxy autenticado de download, mas depende dos arquivos existirem no storage.

- **Aplicar migrations em ambiente real**
  - `apps/api/migrations/ikazin/004_max_tier_ever.sql`
  - `apps/api/migrations/ikazin/005_user_recent_views.sql`
  - O código já consome essas capacidades; falta efetivar nos ambientes.

- **Homologar Stripe real**
  - O webhook `/api/v1/ikazin/stripe/webhook` já existe e ativa plano automaticamente.
  - Falta validar com:
    - `STRIPE_SECRET_KEY`
    - `STRIPE_WEBHOOK_SECRET`
    - `STRIPE_PRICE_BASIC`
    - `STRIPE_PRICE_ESSENTIALS`
    - `STRIPE_PRICE_ADVANCED`
    - `STRIPE_PRICE_PREMIUM`
  - O que continua pendente não é implementação, é compra real + credenciais reais.

- **Rodar smoke test real**
  - Fluxo alvo:
    - `login -> home/org -> dashboard -> catalogo -> build -> play -> materials download`
  - Hoje esse teste ainda depende dos itens acima.

### P1 — importante antes de abrir tráfego

- **Configurar SMTP**
  - Necessário para lead magnet/email operacional.
  - Falta preencher:
    - `LEARNHOUSE_EMAIL_PROVIDER=smtp`
    - `LEARNHOUSE_SMTP_HOST`
    - `LEARNHOUSE_SMTP_PORT`
    - `LEARNHOUSE_SMTP_USERNAME`
    - `LEARNHOUSE_SMTP_PASSWORD`
    - `LEARNHOUSE_SMTP_USE_TLS`
    - `LEARNHOUSE_SYSTEM_EMAIL_ADDRESS`

- **Configurar PostHog**
  - Falta criar projeto e setar `NEXT_PUBLIC_POSTHOG_KEY`.

- **Homologar welcome pós-compra**
  - O redirect para `/orgs/{slug}/welcome` já existe.
  - Ainda falta validar o fluxo real compra -> ativação -> entrada do usuário.

## 2. O que já está pronto

- Webhook Stripe implementado e idempotente.
- Endpoint admin de ativação continua disponível.
- Download autenticado por proxy da API implementado.
- Estados de player e materiais agora expõem erro/motivo real.
- `ikazin_max_tier_ever` já está suportado no backend.
- `ikazin_user_recent_views` já está preparado para personalização futura.
- Risco multi-org no catálogo foi corrigido usando `orgslug` da rota.

## 3. Pendências visuais

### Browser QA manual

- Desktop:
  - `/`
  - `/planos`
  - `/planos/basic`
  - `/blog`
  - `/blog/[slug]`
  - `/auth/login`
  - `/dashboard`
  - `/catalogo`
  - `/build/1`
  - `/welcome`

- Mobile:
  - scroll horizontal nas rows
  - tap em card
  - sticky download bar
  - filtros mobile do catálogo
  - header sem corte

- Dark mode:
  - sem flash branco
  - org selector dark
  - admin dark consistente

### Interações/componentes ainda sem validação manual

- Mini-player sticky
- Command Palette `Cmd/Ctrl+K`
- BuildCard hover progressivo
- IkazinModal em callsites reais
- BuildVideoPlayer v2
- MaterialsList v2
- HorizontalRow v2
- Visual regression de `/planos`, `/blog`, `/planos/basic`
- Shiki render em artigo real
- Avatar ring após upgrade real
- Page transitions entre `/dashboard`, `/catalogo`, `/build/1`

### Pendências visuais ainda de implementação

- `MaterialsList`: skeleton e tooltip com motion
- `IkazinModal`: aplicar em downgrade/build complete
- `FeaturedPostCard` ainda não extraído
- `.btn-primary` ainda não centralizado
- Badge `Membro {Tier}` no topbar
- Página `/conta` com stats
- `IkazinBadge` ainda não substituiu todos os status visuais ad-hoc

## 4. Gates técnicos ainda abertos

- `cd apps/web && npx tsc --noEmit`
- `npm run lint`
- `next build`
- Lighthouse em `/dashboard`, `/catalogo`, `/build/1`
- axe-core em `/dashboard`, `/catalogo`, `/build/1`, `/planos`

## 5. Ordem recomendada

1. Aplicar `.env` real de API e storage.
2. Rodar migrations `004` e `005`.
3. Publicar 1 build HLS real.
4. Subir arquivos reais de material.
5. Homologar Stripe webhook com compra real.
6. Rodar smoke test completo em browser.
7. Fechar QA visual desktop/mobile/dark mode.
