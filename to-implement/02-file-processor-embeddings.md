# Workflow 2 — File Processor + Embeddings

> **Status:** Concluído  
> **Doc:** [`documentation/n8n/concluded/file-processor.md`](../documentation/n8n/concluded/file-processor.md)
> **Path:** `knowledge-file-processing`  
> **Quem chama:** Backend (`knowledge.service.ts` → `startProcessing()`)

Processa CSV/XLSX, gera chunks, **embedda cada chunk via Ollama**, salva no backend com pgvector.

---

## Canvas atual → onde encaixar

```
[existente] webhook → callback 0% → get file → switch → extract csv/xlsx
    → map chunks → callback 45%
    → [NOVOS NODES ABAIXO]
    → save chunks → finish process
```

Inserir **4 nodes novos** entre `callback 45%` e `save chunks`.

---

## Fluxo completo

```
1.  Webhook (Immediately)
2.  HTTP PUT → status processing
3.  HTTP GET → downloadUrl
4.  Switch → csv | xlsx
5.  Extract from File
6.  Code → map chunks
7.  HTTP PUT → progress 45%
8.  Code → explode chunks          ← NOVO
9.  HTTP → ollama embed chunk      ← NOVO (por item)
10. Code → attach embedding        ← NOVO
11. Code → aggregate chunks        ← NOVO
12. HTTP POST → /chunks
13. HTTP PUT → status ready
```

---

## Nodes existentes (referência rápida)

### Webhook `file-processor`

| Parâmetro | Valor |
|-----------|-------|
| Path | `knowledge-file-processing` |
| Response Mode | **Immediately** (fire-and-forget) |

**Payload do backend:**

```json
{
  "fileId": "uuid",
  "agentId": "uuid",
  "storageUrl": "s3://...",
  "downloadUrl": "https://...",
  "fileType": "csv | xlsx",
  "embeddingModel": "nomic-embed-text",
  "embeddingDimensions": 768
}
```

### map chunks — saída esperada

```json
{
  "fileId": "uuid",
  "chunks": [
    { "content": "### Arquivo: ...\n\n### Linha 1\n...", "chunkIndex": 0 }
  ],
  "totalChunks": 2
}
```

Código completo do map chunks: `documentation/n8n/concluded/file-processor.md` (seção flatten + chunk).

### callback 45%

| Parâmetro | Valor |
|-----------|-------|
| Method | PUT |
| URL | `={{ ($vars.API_URL) + '/api/knowledge/files/' + $('map chunks').item.json.fileId }}` |
| Header | `x-webhook-secret: {{ $vars.N8N_WEBHOOK_SECRET }}` |
| Body | `={{ JSON.stringify({ progress: 45 }) }}` |

---

## Node NOVO 8 — Code `explode chunks`

**Conecta:** `callback 45%` → `explode chunks`

| Parâmetro | Valor |
|-----------|-------|
| Mode | **Run Once for All Items** |

```javascript
const { fileId, chunks } = $('map chunks').first().json;

if (!chunks?.length) {
  throw new Error('Nenhum chunk para embeddar');
}

return chunks.map((c) => ({
  json: {
    fileId,
    content: c.content,
    chunkIndex: c.chunkIndex,
  },
}));
```

> Ajuste `$('map chunks')` para o nome exato do seu node.

**Saída:** N items (1 por chunk).

---

## Node NOVO 9 — HTTP Request `ollama embed chunk`

**Conecta:** `explode chunks` → `ollama embed chunk`

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
  "model": "={{ $vars.EMBEDDING_MODEL || 'nomic-embed-text' }}",
  "input": "={{ $('explode chunks').item.json.content }}"
}
```

> Proxy no backend → Ollama local. Use **`API_URL`** (ngrok porta 3000), não `OLLAMA_URL`.

---

## Node NOVO 10 — Code `attach embedding`

**Conecta:** `ollama embed chunk` → `attach embedding`

| Parâmetro | Valor |
|-----------|-------|
| Mode | **Run Once for Each Item** |

```javascript
const src = $('explode chunks').item.json;
const embedding =
  $input.item.json.embeddings?.[0] ?? $input.item.json.embedding ?? [];

if (!embedding?.length) {
  throw new Error(`Embedding vazio no chunk ${src.chunkIndex}`);
}

return {
  json: {
    fileId: src.fileId,
    content: src.content,
    chunkIndex: src.chunkIndex,
    embedding,
  },
};
```

---

## Node NOVO 11 — Code `aggregate chunks`

**Conecta:** `attach embedding` → `aggregate chunks`

| Parâmetro | Valor |
|-----------|-------|
| Mode | **Run Once for All Items** |

```javascript
const fileId = $input.first().json.fileId;
const chunks = $input.all().map((i) => ({
  content: i.json.content,
  chunkIndex: i.json.chunkIndex,
  embedding: i.json.embedding,
}));

chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

return [{
  json: {
    fileId,
    chunks,
    totalChunks: chunks.length,
    vectors: chunks.length,
  },
}];
```

---

## Node 12 — HTTP `save chunks` (ajustar)

**Conecta:** `aggregate chunks` → `save chunks`

| Parâmetro | Valor |
|-----------|-------|
| Method | POST |
| URL | `={{ ($vars.API_URL) + '/api/knowledge/files/' + $json.fileId + '/chunks' }}` |
| Header | `x-webhook-secret: {{ $vars.N8N_WEBHOOK_SECRET }}` |
| Header | `Content-Type: application/json` |
| Body | `={{ JSON.stringify({ chunks: $json.chunks }) }}` |

**Contrato:**

```json
{
  "chunks": [
    {
      "content": "texto...",
      "chunkIndex": 0,
      "embedding": [0.01, -0.02, "... 768 valores"]
    }
  ]
}
```

**Resposta:** `{ "saved": 2, "vectors": 2 }`

---

## Node 13 — HTTP `finish process` (ajustar)

**Conecta:** `save chunks` → `finish process`

| Parâmetro | Valor |
|-----------|-------|
| Method | PUT |
| URL | `={{ ($vars.API_URL) + '/api/knowledge/files/' + $('aggregate chunks').item.json.fileId }}` |
| Header | `x-webhook-secret: {{ $vars.N8N_WEBHOOK_SECRET }}` |
| Body | expressão abaixo |

```
={{
  JSON.stringify({
    status: 'ready',
    progress: null,
    chunks: $('aggregate chunks').item.json.totalChunks,
    vectors: $('aggregate chunks').item.json.vectors,
    indexedAt: new Date().toISOString(),
  })
}}
```

---

## Node “Embeddings Ollama” solto no canvas

O node LangChain **Embeddings Ollama** é sub-node de Vector Store — **não use** no fluxo principal. Use **HTTP Request → `/api/internal/embed`** via `API_URL` (proxy backend → Ollama).

---

## Checklist de implementação

- [ ] Nodes 8–11 criados e conectados entre callback 45% e save chunks
- [ ] `API_URL` no N8N = URL ngrok do backend (`ngrok http 3000`)
- [ ] `npm run ollama:setup` executado (Ollama local no Docker)
- [ ] Workflow **Active**
- [ ] Re-upload planilha GHG no frontend
- [ ] Arquivo fica `ready` com `vectors > 0`
- [ ] Chunks no banco com embedding (768 dims)

---

## Teste

1. Upload `ferramenta_ghg_protocol.xlsx`
2. Acompanhar execução no N8N (Executions)
3. Verificar cada chunk passou pelo HTTP Ollama
4. `GET /api/knowledge/files` → status `ready`, `vectors: N`
5. Chat: pergunta sem palavra exata do arquivo (após WF #1 ativo)

---

## Erros comuns

| Sintoma | Causa |
|---------|-------|
| `vectors: 0` no finish | Embeddings não foram anexados ao POST /chunks |
| 400 no /chunks | Embedding com dimensão ≠ 768 |
| Ollama timeout | Chunks muito grandes; reduzir `ROWS_PER_CHUNK` no map chunks |
| N8N não alcança Ollama | `localhost` — usar URL pública |
