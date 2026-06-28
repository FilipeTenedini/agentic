# FlowAssist N8N — Visão Geral

> Leia este arquivo antes de criar qualquer workflow. Os demais arquivos (`01` a `08`) são guias sequenciais para implementação com IA no N8N.

## O que o N8N faz no FlowAssist

O backend **não chama LLM nem processa arquivos** em produção. Ele delega ao N8N:

| Responsabilidade | Quando ativa | Mock equivalente |
|---|---|---|
| Chat interno (LLM) | `MOCK_AI=false` | Respostas simuladas no backend |
| Processamento RAG | `MOCK_RAG=false` | Timers simulados no backend |
| WhatsApp (mensagens + conexão) | `MOCK_WHATSAPP=false` | QR/status simulados |

## Arquitetura

```
Frontend → Backend (JWT) → N8N (webhooks) → LLM / Evolution / PostgreSQL
                ↑__________________|
              callbacks com webhook secret
```

## Autenticação (obrigatório em todos os workflows)

**Backend chama N8N:**
- Header: `x-webhook-secret: {N8N_WEBHOOK_SECRET}`
- Validar no primeiro node após o Webhook; rejeitar se inválido.

**N8N chama Backend:**
- Header: `x-webhook-secret: {N8N_WEBHOOK_SECRET}` (unico secret bidirecional)
- Base URL: `{API_URL}` (ex.: `http://localhost:3000`)

## Variáveis a configurar no N8N

| Variável | Exemplo | Uso |
|---|---|---|
| `API_URL` | `http://localhost:3000` | Callbacks ao backend |
| `N8N_WEBHOOK_SECRET` | igual ao backend `.env` | Header em todas as chamadas backend↔n8n |
| `OPENAI_API_KEY` | sk-... | Chat + embeddings |
| `EVOLUTION_API_URL` | `http://localhost:8080` | WhatsApp |
| `EVOLUTION_API_KEY` | ... | WhatsApp |
| `DATABASE_URL` | postgresql://... | Busca vetorial (Workflow 04) |

## Os 8 workflows

| Arquivo | Workflow | Tipo | Disparado por |
|---|---|---|---|
| `05` | Executar LLM | Webhook | Backend (`personal-use-chat`) |
| `07` | Processar arquivo | Webhook | Backend (`knowledge-file-processing`) |
| `08` | Eventos WhatsApp | Webhook Evolution | Evolution API |
| `02` | Buscar agente | Sub-workflow | Workflows 01 e 05 |
| `03` | Montar prompt | Sub-workflow | Workflows 01 e 05 |
| `04` | Buscar conhecimento | Sub-workflow | Workflow 01 |
| `06` | Salvar histórico | Sub-workflow | Workflow 01 |
| `01` | Receber WhatsApp | Webhook Evolution | Evolution API |

## Ordem recomendada de criação

Crie nesta ordem para testar incrementalmente:

1. **05** — Chat interno funciona com `MOCK_AI=false`
2. **07** — Upload RAG funciona com `MOCK_RAG=false`
3. **08** — Status de conexão WhatsApp
4. **02, 03, 04, 06** — Sub-workflows reutilizáveis
5. **01** — Orquestrador WhatsApp completo

## Contratos essenciais

**Personalidade (`AgentPersonality`):** `temperature`, `creativity`, `formality`, `objectivity`, `technicalLevel`, `writingStyle`, `emojiUsage`, `responseLength` (todos 0–100 exceto os enums).

**Canais:** `"personalUse"` | `"whatsapp"` (camelCase).

**Status de arquivo:** `uploading` → `processing` → `ready` | `error`.

**Embeddings:** 1536 dimensões (`text-embedding-3-small`).

**Instância WhatsApp:** `instanceName = "flowassist-" + agentId.substring(0, 8)`.

## Checklist go-live

- [ ] Workflows 01–08 criados e ativos
- [ ] Secrets validados nos dois sentidos
- [ ] `MOCK_AI`, `MOCK_RAG`, `MOCK_WHATSAPP` = `false` no backend
- [ ] Evolution webhooks apontando para N8N
- [ ] Teste: chat interno → resposta real
- [ ] Teste: upload PDF → status `ready` → busca RAG
- [ ] Teste: WhatsApp mensagem → resposta → histórico no backend

## Referência

Documentação completa: `documentation/BACKEND-INTEGRACAO.md`
