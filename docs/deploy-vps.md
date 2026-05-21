# Deploy em VPS Própria

Guia operacional para rodar `io.ikazin.com.br` em infraestrutura própria, com foco em:

- VPS Linux sob seu controle
- Docker Compose
- reverse proxy padrão de mercado
- banco e Redis no mesmo host ou em hosts separados
- recomendações de escala por estágio

Este guia assume Ubuntu 24.04 LTS, mas funciona com Debian 12 e derivados com ajustes mínimos.

---

## 1. Quando usar este modelo

Use VPS própria quando você quer:

- controle total sobre domínio, rede e backups
- custo previsível no início
- liberdade para subir MinIO, Postgres e Redis junto da aplicação
- simplicidade operacional antes de migrar para cluster/Kubernetes

Evite este modelo quando você já precisa de:

- alta disponibilidade real entre zonas
- failover automático
- autoscaling horizontal agressivo
- time de operação com runbooks maduros

---

## 2. Arquitetura recomendada

### Opção A — VPS única

Boa para MVP, beta fechado e primeiros alunos pagantes.

```text
Internet
  -> Nginx / Caddy / Traefik
  -> learnhouse-app (container único com web + api + collab + nginx interno)
  -> PostgreSQL
  -> Redis
  -> MinIO
```

### Opção B — app separado de dados

Boa quando o tráfego começa a crescer e você quer reduzir risco operacional.

```text
VPS 1
  -> reverse proxy
  -> learnhouse-app

VPS 2
  -> PostgreSQL
  -> Redis
  -> MinIO
```

### Opção C — storage externo, app em VPS

Boa quando vídeo e materiais começam a crescer mais rápido que CPU/RAM da aplicação.

```text
VPS app
  -> reverse proxy
  -> learnhouse-app
  -> PostgreSQL
  -> Redis

Storage externo
  -> S3 / R2 / MinIO dedicado
```

---

## 3. Recomendação de escala por estágio

### Estágio 1 — validação / pré-beta

- 2 vCPU
- 4 GB RAM
- 80 GB SSD
- 1 VPS única

Serve para:

- time pequeno
- deploy interno
- validação técnica
- poucos alunos simultâneos

Riscos:

- build local consome RAM
- HLS e downloads podem pressionar disco rapidamente
- banco, app e storage competem pelos mesmos recursos

### Estágio 2 — primeiros 50 a 150 alunos

- 4 vCPU
- 8 GB RAM
- 160 GB SSD
- preferencialmente MinIO separado ou disco dedicado

Serve para:

- beta pago
- uploads de materiais reais
- player HLS com uso regular

Recomendação:

- manter Postgres e Redis locais
- mover storage para bucket externo ou MinIO com volume separado
- backup diário obrigatório

### Estágio 3 — 150 a 500 alunos

- 6 a 8 vCPU
- 12 a 16 GB RAM
- 250+ GB SSD
- app e dados separados

Recomendação:

- VPS 1: reverse proxy + app
- VPS 2: Postgres + Redis + MinIO
- snapshots frequentes
- monitoramento básico de CPU, RAM, disco e latência

### Estágio 4 — acima de 500 alunos

Não use mais “uma VPS com tudo” como padrão.

Recomendação mínima:

- Postgres gerenciado ou VPS dedicada
- Redis separado
- storage fora do host de aplicação
- CDN para assets e HLS
- estratégia clara de rollback

---

## 4. Stack mínima recomendada

### Sistema operacional

- Ubuntu 24.04 LTS

### Runtime

- Docker Engine
- Docker Compose v2

### Reverse proxy

Escolha um:

- `Caddy`: mais simples para TLS automático
- `Traefik`: melhor se você já usa labels Docker e múltiplos apps
- `Nginx`: bom se seu time já opera Nginx com conforto

### Dados

- PostgreSQL 16 + `pgvector`
- Redis 7

### Storage

Para Ikazin:

- MinIO local/dedicado
- ou S3/R2 compatível

### Observabilidade mínima

- logs do Docker
- healthcheck HTTP
- backup agendado
- alertas simples de disco e memória

---

## 5. Pré-requisitos de rede e DNS

Antes do deploy:

- apontar `io.ikazin.com.br` para o IP público da VPS
- abrir portas `80` e `443`
- se usar painel do proxy, restringir por IP
- garantir sincronização de horário (`systemd-timesyncd` ou `chrony`)

Checklist:

- [ ] DNS A/AAAA configurado
- [ ] firewall ativo
- [ ] SSH sem senha, com chave
- [ ] usuário sem privilégios totais para operação diária

---

## 6. Tutorial 1 — preparo da VPS

### 6.1 Criar usuário operacional

```bash
adduser deploy
usermod -aG sudo deploy
```

### 6.2 Atualizar sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 6.3 Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

### 6.4 Estrutura recomendada

```text
/srv/ikazin/
├── docker-compose.yml
├── .env
├── backups/
├── minio/
├── postgres/
└── redis/
```

```bash
sudo mkdir -p /srv/ikazin/{backups,minio,postgres,redis}
sudo chown -R $USER:$USER /srv/ikazin
```

---

## 7. Tutorial 2 — deploy com Docker Compose

### 7.1 Compose base

Exemplo para VPS própria com Caddy/Traefik/Nginx fora do escopo do container:

```yaml
name: ikazin

services:
  app:
    image: ghcr.io/fsoares-ikazin/io.ikazin.com.br:latest
    container_name: ikazin-app
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - ikazin
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  db:
    image: pgvector/pgvector:pg16
    container_name: ikazin-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - /srv/ikazin/postgres:/var/lib/postgresql/data
    networks:
      - ikazin
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 4s
      retries: 10

  redis:
    image: redis:7.2.3-alpine
    container_name: ikazin-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - /srv/ikazin/redis:/data
    networks:
      - ikazin
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 4s
      retries: 10

  minio:
    image: minio/minio:latest
    container_name: ikazin-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - /srv/ikazin/minio:/data
    networks:
      - ikazin

networks:
  ikazin:
    driver: bridge
```

### 7.2 `.env` base

Use `apps/api/.env.example` como referência para o backend Ikazin e complete com:

```env
POSTGRES_USER=learnhouse
POSTGRES_PASSWORD=troque-esta-senha
POSTGRES_DB=learnhouse

LEARNHOUSE_SQL_CONNECTION_STRING=postgresql://learnhouse:troque-esta-senha@db:5432/learnhouse
LEARNHOUSE_REDIS_CONNECTION_STRING=redis://redis:6379/learnhouse

LEARNHOUSE_DOMAIN=io.ikazin.com.br
LEARNHOUSE_FRONTEND_DOMAIN=io.ikazin.com.br
LEARNHOUSE_COOKIE_DOMAIN=.ikazin.com.br

NEXTAUTH_URL=https://io.ikazin.com.br
NEXTAUTH_SECRET=troque-por-um-secret-forte

NEXT_PUBLIC_LEARNHOUSE_API_URL=https://io.ikazin.com.br/api/v1/
NEXT_PUBLIC_LEARNHOUSE_BACKEND_URL=https://io.ikazin.com.br/
NEXT_PUBLIC_LEARNHOUSE_DOMAIN=io.ikazin.com.br
NEXT_PUBLIC_LEARNHOUSE_TOP_DOMAIN=ikazin.com.br
NEXT_PUBLIC_LEARNHOUSE_HTTPS=True
NEXT_PUBLIC_COLLAB_URL=wss://io.ikazin.com.br/collab

LEARNHOUSE_CONTENT_DELIVERY_TYPE=s3api
LEARNHOUSE_S3_API_BUCKET_NAME=ikazin-media
LEARNHOUSE_S3_API_ENDPOINT_URL=http://minio:9000
LEARNHOUSE_S3_API_ACCESS_KEY_ID=minioadmin
LEARNHOUSE_S3_API_SECRET_ACCESS_KEY=troque-esta-senha
LEARNHOUSE_S3_API_REGION_NAME=us-east-1

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=troque-esta-senha
```

### 7.3 Subir stack

```bash
cd /srv/ikazin
docker compose pull
docker compose up -d
docker compose ps
```

### 7.4 Testes mínimos

```bash
docker logs ikazin-app --tail=100
docker exec ikazin-app curl -sf http://localhost/api/v1/health
docker exec ikazin-db pg_isready -U learnhouse
docker exec ikazin-redis redis-cli ping
```

---

## 8. Tutorial 3 — reverse proxy

## Opção recomendada: Caddy

Boa para VPS própria simples.

### `Caddyfile`

```caddy
io.ikazin.com.br {
  encode gzip zstd

  reverse_proxy /api/v1/* 127.0.0.1:80
  reverse_proxy /api/auth/* 127.0.0.1:80
  reverse_proxy /content/* 127.0.0.1:80
  reverse_proxy /collab* 127.0.0.1:80
  reverse_proxy 127.0.0.1:80
}
```

Se você expuser o container com `ports: ["127.0.0.1:8080:80"]`, o proxy deve apontar para `127.0.0.1:8080`.

## Opção Nginx

Use quando você já opera Nginx no host.

```nginx
server {
    listen 80;
    server_name io.ikazin.com.br;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Opção Traefik

Use quando você hospeda vários apps com labels Docker.

Recomendação:

- não exponha portas do app no host
- conecte o container à rede do Traefik
- roteie pela porta interna `80`

---

## 9. Tutorial 4 — storage HLS e downloads

Para Ikazin funcionar de verdade, não basta subir web/api:

- publicar HLS em `ikazin/builds/{build_number}/hls/`
- subir materiais `.exe`, `.zip`, `.pdf`
- garantir que os `file_key` dos builds apontam para objetos reais

### 9.1 Criar bucket

No MinIO:

- bucket: `ikazin-media`

### 9.2 Publicar HLS

Use o script já presente no repositório:

```bash
./publish_build_hls.sh <build_number> /caminho/video.mp4 <mc_alias> ikazin-media
```

### 9.3 Conferir backend

Se o storage estiver correto:

- `/api/v1/ikazin/builds/{id}` retorna `playback_url`
- downloads deixam de retornar `503`

---

## 10. Tutorial 5 — deploy inicial do Ikazin

Ordem prática recomendada:

1. Subir Postgres, Redis e app.
2. Confirmar `healthcheck`.
3. Aplicar migrations.
4. Configurar MinIO/S3.
5. Publicar 1 build HLS real.
6. Subir 1 conjunto real de materiais.
7. Configurar Stripe e SMTP.
8. Rodar smoke test do fluxo real.

---

## 11. Migrations

Se o startup não aplicar automaticamente:

```bash
docker exec ikazin-app sh -c "cd /app/api && uv run alembic upgrade head"
```

Para o bloco Ikazin atual, confirme que os ambientes têm:

- `004_max_tier_ever.sql`
- `005_user_recent_views.sql`

---

## 12. Backup, restore e retenção

### Backup manual do banco

```bash
docker exec ikazin-db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} \
  | gzip > /srv/ikazin/backups/ikazin-$(date +%Y%m%d-%H%M).sql.gz
```

### Restore

```bash
gunzip -c /srv/ikazin/backups/ikazin-YYYYMMDD-HHMM.sql.gz \
  | docker exec -i ikazin-db psql -U ${POSTGRES_USER} ${POSTGRES_DB}
```

### Retenção mínima

- banco: 7 backups diários
- storage: snapshot diário ou replicação
- `.env`: cópia offline segura

### Cron de exemplo

```bash
0 3 * * * docker exec ikazin-db pg_dump -U learnhouse learnhouse | gzip > /srv/ikazin/backups/ikazin-$(date +\%Y\%m\%d).sql.gz
0 4 * * * find /srv/ikazin/backups -name "ikazin-*.sql.gz" -mtime +7 -delete
```

---

## 13. Atualização e rollback

### Atualização

```bash
cd /srv/ikazin
docker compose pull
docker compose up -d
docker compose ps
```

### Fluxo seguro

1. backup do banco
2. pull da imagem
3. restart do app
4. teste de healthcheck
5. smoke test rápido em produção

### Rollback

Se usar tags versionadas:

```bash
docker compose down
# editar a tag da imagem
docker compose up -d
```

Se houve migration incompatível:

- restaurar backup do banco
- voltar imagem anterior

---

## 14. Recomendações de escala

### CPU

Sinais para subir CPU:

- build de imagem muito lento
- TTFB subindo em rotas autenticadas
- player e dashboard lentos em horários de pico

Suba primeiro para:

- `2 -> 4 vCPU`
- depois `4 -> 6/8 vCPU`

### RAM

Sinais para subir RAM:

- OOM killer
- reinício de containers
- Postgres matando cache
- build quebrando durante `next build`

Mínimos práticos:

- 4 GB: só MVP
- 8 GB: operação inicial séria
- 12/16 GB: quando há vídeo, materiais e tráfego real

### Disco

Nunca subestime storage quando há HLS.

Planeje separadamente:

- banco
- uploads
- HLS
- backups

Se usar MinIO no mesmo host:

- prefira volume dedicado
- monitore ocupação de disco com alerta em `70%` e `85%`

### Banco

Quando separar o banco:

- acima de ~150 alunos
- quando analytics/queries começarem a disputar CPU
- quando backup/restore do host único já estiverem demorando demais

### Storage

Quando tirar storage do mesmo host:

- quando vídeo crescer rápido
- quando upload/download já competir com o app
- quando precisar de CDN na frente do conteúdo

---

## 15. Monitoramento mínimo recomendado

No mínimo, acompanhe:

- CPU %
- RAM %
- disco %
- `docker compose ps`
- healthcheck `/api/v1/health`
- tamanho do banco
- crescimento do bucket HLS

Ferramentas simples aceitáveis:

- Uptime Kuma
- Netdata
- Grafana + Prometheus

---

## 16. Problemas comuns

| Sintoma | Causa provável | Ação |
|---|---|---|
| `502` no domínio | proxy apontando para porta errada | confirmar porta publicada e upstream |
| login falha | `NEXTAUTH_URL` ou cookie domain incorreto | revisar `.env` |
| WebSocket desconecta | `NEXT_PUBLIC_COLLAB_URL` errado | usar `wss://` em produção |
| player não toca | HLS não publicado ou storage mal configurado | validar bucket e `playback_url` |
| downloads dão `503` | MinIO/S3 sem credenciais válidas | revisar `LEARNHOUSE_S3_API_*` |
| build do Docker quebra | RAM insuficiente | buildar em host maior ou separar pipeline |
| sessão expira após restart | secret mudou | fixar `NEXTAUTH_SECRET` e demais secrets |

---

## 17. Checklist final de produção

- [ ] domínio apontando para a VPS
- [ ] TLS ativo
- [ ] healthcheck passando
- [ ] Postgres e Redis saudáveis
- [ ] storage configurado
- [ ] 1 build HLS real publicado
- [ ] 1 conjunto de materiais reais publicado
- [ ] Stripe configurado
- [ ] SMTP configurado
- [ ] backup automático funcionando
- [ ] smoke test completo rodado

---

## 18. Relação com os outros documentos

- Deploy atual do projeto: [deploy.md](/home/phtech/dev/plataforma-ikazin/io.ikazin.com.br/docs/deploy.md)
- Bloqueios reais de lançamento: [ikazin-launch-blockers.md](/home/phtech/dev/plataforma-ikazin/io.ikazin.com.br/docs/ikazin-launch-blockers.md)
- Visão da plataforma: [PLATFORM.md](/home/phtech/dev/plataforma-ikazin/io.ikazin.com.br/PLATFORM.md)
