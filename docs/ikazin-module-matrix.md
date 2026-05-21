# Ikazin Module Matrix

Estado baseado no código atual do repositório em `2026-05-20`.

| Módulo | Status | Estado atual | Gap principal |
|---|---|---|---|
| Login e sessão LearnHouse | Funciona | Auth base reutilizada do LearnHouse | Falta validar E2E em navegador |
| Área do aluno `/dashboard` | Funciona | Dashboard Ikazin implementado com hero, rows e analytics | Sem teste visual final nesta sessão |
| Catálogo `/catalogo` | Funciona | Lista builds, locked/unlocked e filtros base | Falta validar regras finais de plano com dados reais |
| Página do build `/build/[id]` | Parcial | Player HLS, progresso, complete, paywall de locked e próximo build implementados | Depende de assets HLS e validação E2E final |
| Player de vídeo | Parcial | Stack atual é `MinIO + HLS + hls.js`, não Vimeo | Depende de assets HLS existirem no storage |
| Progresso e resume | Funciona | `GET /resume`, `POST /progress`, `PUT /complete` implementados | Falta validação E2E com vídeo real |
| Materiais do build | Parcial | UI pronta com placeholder e botões desabilitados | Download real ainda não implementado |
| Downloads backend | Funciona | Router agora registra intenção e lista histórico do usuário | Download real com URL/storage ainda não existe |
| Gating por plano Ikazin | Parcial | Regra corrigida para exigir `ikazin_plan` pago e anônimo = `no_access` | Fluxo comercial ainda precisa preencher `details/profile.ikazin_plan` |
| Dashboard analytics | Funciona | PostHog instrumentado no dashboard, catálogo e build | Falta leitura do funil em produção |
| Welcome / onboarding | Parcial | Wizard funcional com 3 steps e recomendação inicial | Ainda não está conectado ao pós-pagamento/magic link |
| Pós-pagamento / ativação | Gap | Não comprovado fechado no estado atual do repo | Falta fluxo completo de cobrança → plano → acesso |
| Admin da organização | Funciona | `/dash` protegido por RBAC e com módulos de gestão | Falta homologação funcional por perfil |
| Superadmin | Funciona | `/admin` separado com auth própria | Falta validação operacional |
| Blog CTAs | Funciona | CTA inline/final e lead magnet foram adicionados | Depende de operação de email/lead real |
| Lead magnet | Parcial | Rota e envio implementados | Falta validar entrega SMTP/arquivo real |
| Documentação arquitetural | Parcial | CLAUDE/PLATFORM/documentos existem | Parte do contexto antigo ainda cita Vimeo |

## Resumo Executivo

- `Funciona`: base de auth, dashboard aluno, catálogo, progresso, admin org, superadmin
- `Parcial`: build page, player HLS, materiais, analytics, plano Ikazin, lead magnet
- `Gap`: onboarding, downloads reais, fluxo pós-pagamento completamente conectado

## Critérios práticos

- `Funciona`: implementado e coerente no código atual
- `Parcial`: implementado, mas com dependência externa, bug conhecido ou integração incompleta
- `Gap`: ausente, placeholder ou TODO explícito
