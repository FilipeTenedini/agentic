# N8N — Workflows a implementar (manual)

> Guias node a node para montar no N8N Cloud. Backend já preparado para estes contratos.

## Status

| # | Workflow | Path webhook | Status |
|---|----------|--------------|--------|
| 1 | [Embed Message](./01-embed-message.md) | `embed-message` | **Concluído** — ver [`documentation/n8n/concluded/embed-message.md`](../documentation/n8n/concluded/embed-message.md) |
| 2 | [File Processor + Embeddings](./02-file-processor-embeddings.md) | `knowledge-file-processing` | **Concluído** — ver [`documentation/n8n/concluded/file-processor.md`](../documentation/n8n/concluded/file-processor.md) |
| 3 | [Personal Use Chat](./03-personal-use-chat.md) | `personal-use-chat` | Concluído (revisar se necessário) |

**Pipeline RAG + chat:** workflows #1, #2 e #3 ativos com `MOCK_RAG=false` e `MOCK_AI=false`.

## Variáveis N8N (Settings → Variables)

| Variável | Exemplo |
|----------|---------|
| `API_URL` | URL pública do backend (ngrok `http 3000`) |
| `N8N_WEBHOOK_SECRET` | = `N8N_WEBHOOK_SECRET` do backend (unico secret bidirecional) |
| `EMBEDDING_MODEL` | `nomic-embed-text` |

> Embeddings: o N8N chama `POST {API_URL}/api/internal/embed` (proxy → Ollama local).
> Não use variável `OLLAMA_URL` — um único ngrok na porta 3000 basta.

## Ollama local (backend)

```bash
cd backend
npm run ollama:setup    # docker + pull nomic-embed-text
npm run dev             # backend com proxy /api/internal/embed
ngrok http 3000         # mesma URL para callbacks e embeddings
```

## Backend `.env` relevante

```env
MOCK_AI=false
MOCK_RAG=false
N8N_URL="https://SEU-N8N.app.n8n.cloud/webhook"
N8N_WEBHOOK_SECRET="..."
EMBEDDING_MODEL="nomic-embed-text"
EMBEDDING_DIMENSIONS=768
VECTOR_SEARCH_MIN_SCORE=0.5
```

## Ordem recomendada (setup inicial)

1. Ollama: `cd backend && npm run ollama:setup` + `ngrok http 3000` → `API_URL` no N8N
2. **#2** File processor → re-upload planilha → `ready` + `vectors > 0`
3. **#1** embed-message → testar curl
4. **#3** personal-use-chat → teste chat end-to-end

## Fluxo completo (chat + RAG)

```
UPLOAD:
  Backend → WF #2 → embed chunks → POST /chunks → pgvector

CADA MENSAGEM:
  Backend → WF #1 embed-message → { embedding }
  Backend → pgvector → systemPrompt
  Backend → WF #3 personal-use-chat → { reply }
```

## Referências

- Embed message (concluído): `documentation/n8n/concluded/embed-message.md`
- File processor (concluído): `documentation/n8n/concluded/file-processor.md`
- Workflows legados: `n8n/00-visao-geral.md`
