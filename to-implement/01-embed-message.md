# Workflow 1 — Embed Message

> **Status:** Pendente  
> **Path:** `embed-message`  
> **Quem chama:** Backend (`embedding.client.ts` → `embedText()`)

Embedda a **pergunta do usuário** a cada mensagem no chat (busca semântica no backend).

---

## Fluxo

```
Webhook → validar secret → IF → HTTP Ollama → extrair → Respond 200
                          └→ Respond 401
```

---

## Node 1 — Webhook

| Parâmetro | Valor |
|-----------|-------|
| HTTP Method | POST |
| Path | `embed-message` |
| Authentication | None |
| Response Mode | **Using 'Respond to Webhook' Node** |

URL: `{N8N_URL}/embed-message`

---

## Node 2 — Code `validar secret`

Mode: **Run Once for All Items**

```javascript
const item = $input.first().json;
const headers = item.headers || {};
const secret = headers['x-webhook-secret'] || headers['X-Webhook-Secret'];
const expected = $vars.N8N_WEBHOOK_SECRET;

if (secret !== expected) {
  return [{ json: { unauthorized: true } }];
}

const body = item.body ?? item;
return [{ json: { unauthorized: false, ...body } }];
```

---

## Node 3 — IF `autorizado?`

| Ramo | Condição | Destino |
|------|----------|---------|
| True | `unauthorized` is true | Respond 401 |
| False | | HTTP Ollama |

---

## Node 4 — Respond to Webhook `401`

| Parâmetro | Valor |
|-----------|-------|
| Respond With | JSON |
| Response Body | `{ "error": "Unauthorized" }` |
| Response Code | 401 |

---

## Node 5 — HTTP Request `ollama embed`

| Parâmetro | Valor |
|-----------|-------|
| Method | POST |
| URL | `={{ ($vars.API_URL).replace(/\/$/, '') + '/api/internal/embed' }}` |
| Header | `Content-Type: application/json` |
| Header | `x-webhook-secret: {{ $vars.N8N_WEBHOOK_SECRET }}` |
| Send Body | JSON |
| Options → Never Error | true |

**JSON Body:**

```json
{
  "model": "={{ $json.model || $vars.EMBEDDING_MODEL || 'nomic-embed-text' }}",
  "input": "={{ $json.text }}"
}
```

> Proxy backend → Ollama local. Mesma `API_URL` dos callbacks de knowledge.

**Payload do backend:**

```json
{
  "text": "e sobre ghg?",
  "model": "nomic-embed-text",
  "dimensions": 768
}
```

---

## Node 6 — Code `extrair embedding`

```javascript
let embedding = [];
try {
  const raw = $input.first().json;
  embedding = raw.embeddings?.[0] ?? raw.embedding ?? [];
} catch {}

if (!embedding.length) {
  throw new Error('Ollama nao retornou embedding');
}

return [{ json: { embedding } }];
```

---

## Node 7 — Respond to Webhook `200`

| Parâmetro | Valor |
|-----------|-------|
| Respond With | JSON |
| Response Body | `={{ { embedding: $json.embedding } }}` |
| Response Code | 200 |

**Resposta obrigatória:** `{ "embedding": [ ... 768 floats ] }`

---

## Teste

```bash
curl -X POST "https://SEU-N8N.app.n8n.cloud/webhook/embed-message" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: SEU_SECRET" \
  -d '{"text":"teste ghg protocol","model":"nomic-embed-text","dimensions":768}'
```

---

## Checklist

- [ ] Workflow **Active**
- [ ] Ollama local: `cd backend && npm run ollama:setup`
- [ ] `API_URL` no N8N = URL ngrok do backend (porta 3000)
- [ ] Resposta com exatamente **768** dimensões
