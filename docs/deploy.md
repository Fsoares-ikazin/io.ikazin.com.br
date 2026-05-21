# Deploy Guide — io.ikazin.com.br

> Para um guia mais completo de VPS própria, sizing, storage, proxy, backup e escala, veja [deploy-vps.md](/home/phtech/dev/plataforma-ikazin/io.ikazin.com.br/docs/deploy-vps.md).

## Arquitetura

```
Internet → Traefik (veranno-proxy :80) → learnhouse-app (:80 interno)
                                               │
                           ┌───────────────────┼───────────────────┐
                      Next.js :8000      FastAPI :9000       Collab :4000
                      (nginx proxy)      (Python API)         (Node WS)
```

**Componentes no container único (`ghcr.io/fsoares-ikazin/io.ikazin.com.br`):**
- Next.js (frontend) — porta 8000
- FastAPI (backend API) — porta 9000
- Collab server (WebSocket) — porta 4000
- Nginx interno — porta 80 (roteamento entre os três)

**Serviços externos (docker-compose):**
- PostgreSQL + pgvector — `learnhouse-db`
- Redis — `learnhouse-redis`

**Infra compartilhada (projeto mercatto.ia):**
- Traefik v2.11 — `veranno-proxy` na rede `mercattoia_veranno-public`

---

## Pré-requisitos

- Docker + Docker Compose v2
- Acesso ao repositório GitHub: `github.com/Fsoares-ikazin/io.ikazin.com.br`
- Traefik `veranno-proxy` rodando (projeto mercatto.ia ativo)
- Domínio `io.ikazin.com.br` apontando para o servidor

---

## 1. Estrutura de arquivos no servidor

```
/home/phtech/.learnhouse/Ikazin.io/
├── docker-compose.yml   ← composição dos serviços
├── .env                 ← variáveis de ambiente (não versionar)
└── extra/               ← configs extras (opcional)
```

---

## 2. docker-compose.yml (produção)

O arquivo em `/home/phtech/.learnhouse/Ikazin.io/docker-compose.yml` deve ser:

```yaml
name: learnhouse

services:
  learnhouse-app:
    image: ghcr.io/fsoares-ikazin/io.ikazin.com.br:latest
    container_name: learnhouse-app
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - HOSTNAME=0.0.0.0
      - LEARNHOUSE_API_URL=http://localhost:9000
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - learnhouse-network
      - veranno-public
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ikazin.entrypoints=web"
      - "traefik.http.routers.ikazin.rule=Host(`io.ikazin.com.br`)"
      - "traefik.http.routers.ikazin.priority=10"
      - "traefik.http.services.ikazin.loadbalancer.server.port=80"
      - "traefik.docker.network=mercattoia_veranno-public"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  db:
    image: pgvector/pgvector:pg16
    container_name: learnhouse-db
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-learnhouse}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB:-learnhouse}
    volumes:
      - learnhouse_db_data:/var/lib/postgresql/data
    networks:
      - learnhouse-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-learnhouse}"]
      interval: 5s
      timeout: 4s
      retries: 5

  redis:
    image: redis:7.2.3-alpine
    container_name: learnhouse-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - learnhouse_redis_data:/data
    networks:
      - learnhouse-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 4s
      retries: 5

networks:
  learnhouse-network:
    driver: bridge
  veranno-public:
    external: true
    name: mercattoia_veranno-public

volumes:
  learnhouse_db_data:
  learnhouse_redis_data:
```

> **Atenção:** sem `ports:` no `learnhouse-app`. Traefik roteia via rede Docker, sem expor porta no host.

---

## 3. .env (produção)

Copiar `.env` existente e atualizar para produção:

```bash
cp /home/phtech/.learnhouse/Ikazin.io/.env /home/phtech/.learnhouse/Ikazin.io/.env.bak
```

Valores que **precisam mudar** de `localhost` para produção:

```env
# Domínio
LEARNHOUSE_DOMAIN=io.ikazin.com.br

# Frontend
NEXT_PUBLIC_LEARNHOUSE_API_URL=https://io.ikazin.com.br/api/v1/
NEXT_PUBLIC_LEARNHOUSE_BACKEND_URL=https://io.ikazin.com.br/
NEXT_PUBLIC_LEARNHOUSE_DOMAIN=io.ikazin.com.br
NEXT_PUBLIC_LEARNHOUSE_TOP_DOMAIN=ikazin.com.br
NEXT_PUBLIC_LEARNHOUSE_HTTPS=True

# NextAuth
NEXTAUTH_URL=https://io.ikazin.com.br

# Cookies
LEARNHOUSE_COOKIE_DOMAIN=.ikazin.com.br

# Collab (WSS em produção)
NEXT_PUBLIC_COLLAB_URL=wss://io.ikazin.com.br/collab
```

Valores que **devem permanecer** usando hostnames Docker internos:

```env
LEARNHOUSE_SQL_CONNECTION_STRING=postgresql://learnhouse:<SENHA>@db:5432/learnhouse
LEARNHOUSE_REDIS_CONNECTION_STRING=redis://redis:6379/learnhouse
LEARNHOUSE_REDIS_URL=redis://redis:6379
LEARNHOUSE_API_URL=http://localhost:9000   # internal — app fala com si mesmo
```

---

## 4. CI/CD — Build da imagem customizada

O workflow padrão (`release.yaml`) publica em `ghcr.io/learnhouse/app` (upstream).
Para o fork, criar `.github/workflows/release-ikazin.yaml`:

```yaml
name: Release Ikazin

on:
  push:
    tags:
      - 'ikazin-[0-9]*'          # ex: ikazin-1.1.4-1

permissions:
  contents: write
  packages: write

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: fsoares-ikazin/io.ikazin.com.br

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract version
        id: version
        run: echo "version=${GITHUB_REF_NAME}" >> $GITHUB_OUTPUT

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.version.outputs.version }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

> Tag de release: `git tag ikazin-1.1.4-1 && git push origin ikazin-1.1.4-1`

---

## 5. Primeiro deploy (setup inicial)

```bash
cd /home/phtech/.learnhouse/Ikazin.io

# 1. Autenticar no GHCR (necessário para pull de imagem privada)
echo $GHCR_PAT | docker login ghcr.io -u Fsoares-ikazin --password-stdin

# 2. Subir serviços
docker compose up -d

# 3. Verificar saúde
docker compose ps
docker compose logs -f learnhouse-app
```

**Checklist pós-deploy:**
- [ ] `curl -f http://localhost/api/v1/health` retorna 200 (de dentro do container)
- [ ] `https://io.ikazin.com.br` abre no browser
- [ ] Login admin funciona com email `LEARNHOUSE_INITIAL_ADMIN_EMAIL`
- [ ] Org "default" criada em `/admin`

---

## 6. Deploy de atualização

```bash
cd /home/phtech/.learnhouse/Ikazin.io

# 1. Backup do banco antes de qualquer atualização
docker exec learnhouse-db pg_dump \
  -U learnhouse learnhouse \
  | gzip > /home/phtech/backups/ikazin-$(date +%Y%m%d-%H%M).sql.gz

# 2. Pull nova imagem
docker compose pull learnhouse-app

# 3. Recrear container (zero-downtime: app fica ~30s down)
docker compose up -d --no-deps learnhouse-app

# 4. Verificar
docker compose ps
docker logs learnhouse-app --tail=50
```

---

## 7. Build local (sem CI/CD)

Quando não há pipeline configurado, buildar direto no servidor:

```bash
cd /home/phtech/dev/io.ikazin.com.br

# Build da imagem local
docker build -t ghcr.io/fsoares-ikazin/io.ikazin.com.br:local .

# Editar docker-compose.yml: trocar image: por image: ghcr.io/fsoares-ikazin/io.ikazin.com.br:local
# Ou usar build: context diretamente (mais lento, usa mais RAM):
#   build:
#     context: /home/phtech/dev/io.ikazin.com.br
#     dockerfile: Dockerfile

docker compose -f /home/phtech/.learnhouse/Ikazin.io/docker-compose.yml up -d --build
```

> Build completo leva ~8–12 min (Next.js + Python deps + Collab).
> RAM necessária durante build: ~3 GB.

---

## 8. Banco de dados

### Backup manual
```bash
docker exec learnhouse-db pg_dump -U learnhouse learnhouse \
  | gzip > ~/backups/ikazin-$(date +%Y%m%d-%H%M).sql.gz
```

### Restore
```bash
gunzip -c ~/backups/ikazin-YYYYMMDD-HHMM.sql.gz \
  | docker exec -i learnhouse-db psql -U learnhouse learnhouse
```

### Backup automático (cron)
```bash
# crontab -e
0 3 * * * docker exec learnhouse-db pg_dump -U learnhouse learnhouse | gzip > /home/phtech/backups/ikazin-$(date +\%Y\%m\%d).sql.gz
# Manter 7 dias
0 4 * * * find /home/phtech/backups -name "ikazin-*.sql.gz" -mtime +7 -delete
```

### Migrations
As migrations rodam automaticamente no startup via `docker-entrypoint.sh`.
Para rodar manualmente:
```bash
docker exec learnhouse-app sh -c "cd /app/api && uv run alembic upgrade head"
```

---

## 9. Logs e monitoramento

```bash
# Todos os serviços
docker compose -f /home/phtech/.learnhouse/Ikazin.io/docker-compose.yml logs -f

# Só o app
docker logs learnhouse-app -f --tail=100

# Health check manual
docker exec learnhouse-app curl -sf http://localhost/api/v1/health

# Status PM2 (dentro do container)
docker exec learnhouse-app pm2 status
```

---

## 10. Rollback

```bash
cd /home/phtech/.learnhouse/Ikazin.io

# Trocar para versão anterior (ex: ikazin-1.1.3-1)
docker compose stop learnhouse-app
docker compose rm -f learnhouse-app

# Editar docker-compose.yml: trocar :latest por :ikazin-1.1.3-1
# Depois:
docker compose up -d learnhouse-app

# Se havia migration: restaurar backup do banco
```

---

## 11. Traefik — diagnóstico

```bash
# Ver rotas registradas no Traefik
curl -s http://localhost:8090/api/http/routers | python3 -m json.tool | grep -A5 "ikazin"

# Verificar se container está na rede pública
docker inspect learnhouse-app | grep -A5 "mercattoia_veranno-public"

# Dashboard Traefik
# http://<servidor>:8090
```

**Problema: Traefik não roteia para ikazin**

1. Container precisa estar em `mercattoia_veranno-public` **e** em `learnhouse-network`
2. Label `traefik.docker.network=mercattoia_veranno-public` obrigatória (container multi-rede)
3. Reiniciar após mudança de labels: `docker compose up -d --no-deps learnhouse-app`

---

## 12. Variáveis de ambiente — referência completa

| Variável | Dev | Produção |
|----------|-----|----------|
| `LEARNHOUSE_DOMAIN` | `localhost` | `io.ikazin.com.br` |
| `NEXT_PUBLIC_LEARNHOUSE_HTTPS` | `False` | `True` |
| `NEXT_PUBLIC_LEARNHOUSE_API_URL` | `http://localhost/api/v1/` | `https://io.ikazin.com.br/api/v1/` |
| `NEXTAUTH_URL` | `http://localhost` | `https://io.ikazin.com.br` |
| `LEARNHOUSE_COOKIE_DOMAIN` | `.localhost` | `.ikazin.com.br` |
| `NEXT_PUBLIC_COLLAB_URL` | `ws://localhost/collab` | `wss://io.ikazin.com.br/collab` |
| `NEXT_PUBLIC_LEARNHOUSE_TOP_DOMAIN` | `localhost` | `ikazin.com.br` |

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| Container não sobe | RAM insuficiente durante build | Build em horário de baixo uso; mínimo 4 GB RAM |
| 502 no browser | Container não está na rede veranno-public | Adicionar rede + label `traefik.docker.network` |
| Login falha em produção | `NEXTAUTH_URL` ainda aponta para localhost | Atualizar `.env` |
| WebSocket desconecta | `NEXT_PUBLIC_COLLAB_URL` usa `ws://` em produção | Trocar para `wss://` |
| Migrations falham | Banco ainda não subiu | `depends_on` + healthcheck resolve; verificar com `docker compose ps` |
| Sessão expira rápido | `NEXTAUTH_SECRET` fraco ou diferente entre restarts | Usar secret forte e fixo no `.env` |
