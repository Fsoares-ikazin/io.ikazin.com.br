# Ikazin Functional Gaps

Estado consolidado em `2026-05-20`, olhando o código atual do repositório.

## 1. O que ainda impede vender melhor

### Conversão

| Gap | Impacto | Estado |
|---|---|---|
| Plano do usuário ainda depende de `details/profile.ikazin_plan` | Sem esse campo, o usuário autenticado continua sem acesso pago | Código de gating corrigido, mas preenchimento comercial ainda depende do fluxo de venda |
| Pós-pagamento ainda não está comprovado ponta a ponta | Compra não garante automaticamente acesso liberado | Continua em aberto |
| CTA de upgrade para builds locked apontava para rota errada | Usuário bloqueado não chegava no pricing correto | Corrigido para `/planos` |
| Usuário sem plano não tinha uma mensagem clara de upsell dentro do produto | Experiência parecia “quebrada” em vez de comercial | Corrigido no dashboard e catálogo |

### Ativação

| Gap | Impacto | Estado |
|---|---|---|
| `/welcome` era placeholder | Não havia aha moment guiado para novo aluno | Corrigido com wizard funcional no frontend |
| Recomendação inicial não estava operacional | Usuário novo caía em tela vazia | Corrigido com engine local no wizard |
| Auto-login por link mágico pós-compra não está comprovado | A entrada após compra ainda não está fechada | Continua em aberto |

### Entrega do produto

| Gap | Impacto | Estado |
|---|---|---|
| Vídeo depende de HLS real no MinIO | Sem assets, o build não entrega valor | Continua dependente de operação/storage |
| Builds bloqueados ainda podiam parecer reproduzíveis até o player falhar | UX ruim para plano insuficiente | Corrigido com paywall claro e `playback_url = null` para build locked |
| Downloads reais não existem ainda | Produto não entrega materiais finais | Backend de tracking implementado; download real continua em aberto |
| Materiais do build continuam placeholder | Valor percebido do build fica incompleto | Continua parcial |

### Operação e prova de venda

| Gap | Impacto | Estado |
|---|---|---|
| Sem validação E2E de browser nesta sessão | Não há homologação final do fluxo completo | Continua em aberto |
| Documentação ainda menciona Vimeo em partes antigas | Risco de desalinhamento operacional | Continua parcial |
| Fluxo Stripe/SMTP depende de credenciais reais | Não dá para homologar compra/email sem ambiente | Continua dependente de ambiente |

## 2. O que já foi corrigido no código

- Regra de plano: anônimo não recebe mais `basic`; sem `ikazin_plan` o usuário fica com `no_access`
- Dashboard: mostra `SEM PLANO` e CTA comercial quando o acesso não está ativo
- Catálogo: CTA comercial visível quando todos os builds estão bloqueados
- Locked build: agora abre paywall claro, sem quebrar o player em 403
- Onboarding `/welcome`: agora existe wizard funcional com recomendação
- Downloads: router deixou de ser `TODO` e ganhou endpoints de tracking/listagem

## 3. Gaps que continuam abertos

- Preenchimento automático de `ikazin_plan` no pós-pagamento
- Fluxo completo compra → acesso → welcome
- Entrega real dos materiais via storage
- HLS publicado no bucket para os builds reais
- Homologação final em navegador com dados reais

## 4. Prioridade prática

### P0

- Garantir que o fluxo comercial escreva `ikazin_plan`
- Publicar ao menos 1 build HLS real
- Validar compra/login/acesso em navegador

### P1

- Entregar downloads reais com storage
- Fechar auto-login pós-pagamento
- Homologar o wizard com recomendação persistida

### P2

- Limpar documentação antiga de Vimeo
- Adicionar histórico de downloads visível no frontend
