# Ollama + N8N Cloud (embeddings)

> Como o N8N Cloud expõe embeddings via backend proxy. Junho/2026.

## Problema

- Ollama roda em `localhost:11434` (Docker no backend).
- N8N Cloud não alcança localhost.
- ngrok **Free** com um domínio não roteia dois serviços (3000 + 11434) na mesma URL.

## Solução

O backend expõe **`POST /api/internal/embed`**, protegido por `x-webhook-secret`, e
repassa ao Ollama local.

```
N8N Cloud  →  ngrok:3000  →  Backend  →  localhost:11434  →  Ollama
              /api/internal/embed              /api/embed
              /api/knowledge/...               (callbacks RAG)
```

**Um único túnel ngrok** na porta 3000 serve callbacks **e** embeddings.

## Setup

```bash
cd backend
docker compose up -d ollama    # ou npm run ollama:setup
npm run dev
ngrok http 3000
```

## N8N — node HTTP de embedding

| Campo | Valor |
| --- | --- |
| Method | POST |
| URL | `={{ ($vars.API_URL).replace(/\/$/, '') + '/api/internal/embed' }}` |
| Header | `Content-Type: application/json` |
| Header | `x-webhook-secret: {{ $vars.N8N_WEBHOOK_SECRET }}` |
| Body | `{ "model": "nomic-embed-text", "input": "..." }` |

Vetor na resposta: **`$json.embeddings[0]`** (768 floats).

## Teste

```bash
curl https://SUA-URL.ngrok-free.dev/api/internal/embed \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: SEU_N8N_WEBHOOK_SECRET" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"model":"nomic-embed-text","input":"teste ghg protocol"}'
```

## Referências

- Spec WF #2 (implementação): [`to-implement/02-file-processor-embeddings.md`](../../to-implement/02-file-processor-embeddings.md)
- **Doc concluída WF #2:** [`documentation/n8n/concluded/file-processor.md`](concluded/file-processor.md)
- Spec WF #1: [`to-implement/01-embed-message.md`](../../to-implement/01-embed-message.md)
- **Doc concluída WF #1:** [`documentation/n8n/concluded/embed-message.md`](concluded/embed-message.md)
- Integração: [`BACKEND-INTEGRACAO.md`](../BACKEND-INTEGRACAO.md) seção 6.3
