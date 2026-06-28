# Requisição de Integração — Stripe Payments
**Plataforma:** Ikazin.io  
**Data:** 2026-05-20  
**Destinatário:** Equipe de Integração / Responsável Stripe  
**Autor:** Arquitetura Ikazin.io

---

## 1. Contexto

A plataforma **Ikazin.io** oferece cursos técnicos de PLC + Digital Twin Siemens divididos em 4 planos de acesso (tiers). O checkout é hospedado pelo Stripe (Stripe Hosted Checkout), sem redirecionar o usuário para fora do domínio. Nenhuma informação de cartão trafega nos servidores da Ikazin.

### URLs de produção

| Serviço | URL |
|---------|-----|
| Frontend | `https://io.ikazin.com.br` |
| API (FastAPI) | `https://api.io.ikazin.com.br` |

---

## 2. Produtos a criar no Stripe Dashboard

Criar **4 produtos**, um por plano, cada um com **dois preços** (BRL e USD), modo **one-time payment** (pagamento único, sem recorrência).

### 2.1 Plano BASIC

| Campo | Valor |
|-------|-------|   
| Nome do produto | `Ikazin — BASIC` |
| Descrição | Builds 1–8: lógica booleana, FSM, sensores, drives G120. Acesso vitalício. |
| Preço BRL | **R$ 399,00** — `one_time` — moeda `brl` |
| Preço USD | **US$ 69,00** — `one_time` — moeda `usd` |
| Metadado do produto | `ikazin_plan = basic` |

### 2.2 Plano ESSENTIALS

| Campo | Valor |
|-------|-------|
| Nome do produto | `Ikazin — ESSENTIALS` |
| Descrição | Builds 9–13: PID, linhas de embalagem, stretch film, gestão de falhas. Acesso vitalício. |
| Preço BRL | **R$ 699,00** — `one_time` — moeda `brl` |
| Preço USD | **US$ 119,00** — `one_time` — moeda `usd` |
| Metadado do produto | `ikazin_plan = essentials` |

### 2.3 Plano ADVANCED

| Campo | Valor |
|-------|-------|
| Nome do produto | `Ikazin — ADVANCED` |
| Descrição | Builds 14–18: SINAMICS S120, acoplamento eletrônico, Rotary Knife, Winder. Acesso vitalício. |
| Preço BRL | **R$ 899,00** — `one_time` — moeda `brl` |
| Preço USD | **US$ 159,00** — `one_time` — moeda `usd` |
| Metadado do produto | `ikazin_plan = advanced` |

### 2.4 Plano PREMIUM

| Campo | Valor |
|-------|-------|
| Nome do produto | `Ikazin — PREMIUM` |
| Descrição | Builds 19–25: robótica SCARA/Delta, CNC G-code, SIMOTION D. Acesso vitalício. |
| Preço BRL | **R$ 1.199,00** — `one_time` — moeda `brl` |
| Preço USD | **US$ 209,00** — `one_time` — moeda `usd` |
| Metadado do produto | `ikazin_plan = premium` |

---

## 3. Variáveis de ambiente necessárias na API

Após criar os produtos e preços no Stripe Dashboard, preencher o arquivo `apps/api/.env` (nunca commitar):

```env
# Stripe — chaves de API
STRIPE_SECRET_KEY=sk_live_...          # Chave secreta do ambiente live
STRIPE_WEBHOOK_SECRET=whsec_...        # Segredo do endpoint de webhook

# Price IDs — BRL (padrão para usuários brasileiros)
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_ESSENTIALS=price_...
STRIPE_PRICE_ADVANCED=price_...
STRIPE_PRICE_PREMIUM=price_...
```

> **Nota:** O sistema hoje usa um único `STRIPE_PRICE_*` por plano. Para suporte a BRL + USD simultâneo, a lógica de seleção de moeda deve ser implementada na camada de checkout (ver seção 5).

---

## 4. Configuração do Webhook

### Endpoint a registrar no Stripe Dashboard

```
URL:    https://api.io.ikazin.com.br/api/v1/ikazin/stripe/webhook
Método: POST
Evento: checkout.session.completed
```

**Passo a passo:**
1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://api.io.ikazin.com.br/api/v1/ikazin/stripe/webhook`
3. Selecionar evento: `checkout.session.completed`
4. Salvar → copiar o **Signing secret** (`whsec_...`) → colar em `STRIPE_WEBHOOK_SECRET`

### O que o webhook faz

Quando `checkout.session.completed` chega:

1. Verifica assinatura Stripe (HMAC-SHA256) via `stripe.Webhook.construct_event`
2. Lê `metadata.user_id` e `metadata.ikazin_plan` da sessão
3. Grava `user.details["ikazin_plan"] = <tier>` no banco PostgreSQL
4. O dashboard do aluno libera os builds automaticamente na próxima requisição

---

## 5. Fluxo completo de compra

```
Usuário em /planos
    │
    ▼
Clica "Começar com ADVANCED"
    │
    ▼
GET /checkout?plan=advanced            ← Frontend io.ikazin.com.br
    │
    ├─ Não autenticado → /auth/login?next=/checkout?plan=advanced
    │
    └─ Autenticado
         │
         ▼
    POST https://api.io.ikazin.com.br/api/v1/ikazin/stripe/checkout
    Body: { "plan": "advanced" }
    Auth: Bearer <access_token>
         │
         ▼
    Stripe Checkout Session criada
    customer_email = e-mail do usuário (pré-preenchido)
    metadata = { user_id: "42", ikazin_plan: "advanced" }
         │
         ▼
    Redireciona → Stripe Hosted Checkout (stripe.com)
         │
         ├─ Cancelamento → https://io.ikazin.com.br/planos
         │
         └─ Pagamento aprovado
               │
               ▼
         Stripe → POST webhook → api.io.ikazin.com.br
               │
               ▼
         assign_ikazin_plan(user, plan="advanced")
               │
               ▼
         Stripe redireciona → https://io.ikazin.com.br/orgs/default/welcome?plan=advanced
               │
               ▼
         Wizard de onboarding → Dashboard com conteúdo liberado
```

---

## 6. Suporte a dual-currency (BRL + USD)

A lógica atual usa um único price ID por plano. Para servir ambas as moedas:

**Opção recomendada — Adaptive Pricing do Stripe:**
- Ativar "Adaptive Pricing" no Dashboard do produto → Stripe converte automaticamente para a moeda local do cartão do cliente sem necessidade de múltiplos price IDs.

**Opção alternativa — dois price IDs por plano:**
- Adicionar variáveis `STRIPE_PRICE_BASIC_USD`, `STRIPE_PRICE_BASIC_BRL`, etc.
- A API seleciona com base no `Accept-Language` ou país do usuário.
- Requer mudança no `ikazin_stripe.py`.

---

## 7. Testes com ambiente sandbox

Antes de ativar o live, usar chaves de **test mode**:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # gerado pelo Stripe CLI em modo test
```

**Stripe CLI para receber webhooks localmente:**
```bash
stripe listen --forward-to http://localhost:1338/api/v1/ikazin/stripe/webhook
```

**Cartão de teste:**
```
Número:  4242 4242 4242 4242
Validade: qualquer data futura
CVV:     qualquer 3 dígitos
```

---

## 8. Checklist de entrega

| Item | Responsável | Status |
|------|-------------|--------|
| Criar conta Stripe (se não existir) | Integração | ☐ |
| Criar 4 produtos com preços BRL e USD | Integração | ☐ |
| Copiar price IDs para `apps/api/.env` | Integração | ☐ |
| Configurar webhook `checkout.session.completed` | Integração | ☐ |
| Copiar `whsec_...` para `STRIPE_WEBHOOK_SECRET` | Integração | ☐ |
| Testar fluxo completo em test mode | QA / Dev | ☐ |
| Substituir chaves test → live em produção | Deploy | ☐ |
| Verificar webhook recebido em produção | Integração | ☐ |

---

## 9. Contato técnico

Dúvidas sobre a implementação da API ou do fluxo de ativação de planos:  
Repositório: `io.ikazin.com.br` branch `dev-front`  
Arquivo de referência: `apps/api/src/routers/ikazin_stripe.py`
