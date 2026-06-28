# Workflow 07 — Processar Arquivo (RAG)

## O que criar

Workflow com webhook que processa arquivos da base de conhecimento: extração, chunking, embeddings e persistência.

## Por que existe

Quando o usuário faz upload no frontend, o backend salva o arquivo e dispara este workflow (`MOCK_RAG=false`). O frontend acompanha o progresso via polling até status `ready`.

**Prioridade:** criar em segundo lugar (após Workflow 05).

## Trigger

- **Tipo:** Webhook (POST)
- **Path:** `knowledge-file-processing`
- **URL:** `{N8N_URL}/webhook/knowledge-file-processing`
- **Quem chama:** Backend (`knowledge.service.ts` → `startProcessing()`)
- **Resposta:** fire-and-forget (backend não aguarda). Atualizações via callbacks.

## Segurança

Validar `x-webhook-secret: {N8N_WEBHOOK_SECRET}` no primeiro node.

## Payload de entrada

```json
{
  "fileId": "uuid-do-arquivo",
  "agentId": "uuid-do-agente",
  "storageUrl": "s3://{userId}/catalogo.csv",
  "downloadUrl": "https://seu-bucket.s3.amazonaws.com/{userId}/catalogo.csv?X-Amz-...",
  "fileType": "csv"
}
```

`storageUrl` e a referencia permanente no S3 (`s3://{userId}/arquivo.ext`). O backend gera `downloadUrl` (URL assinada) ao disparar o workflow — o N8N usa essa URL para baixar o arquivo.

## Fluxo completo (nodes em ordem)

### 1. Webhook + validar secret

### 2. HTTP — Atualizar status: processing
```
PUT {API_URL}/api/knowledge/files/{{ fileId }}
Header: x-webhook-secret: {N8N_WEBHOOK_SECRET}
Body: { "status": "processing", "progress": 0 }
```

### 3. HTTP — Baixar arquivo do S3
```
GET {{ downloadUrl }}
```
O backend envia `downloadUrl` (URL assinada) no payload do webhook. Salvar binario para processamento.

### 4. Switch — Extrair texto por fileType

| fileType | Método sugerido |
|---|---|
| `csv` | Leitura direta (UTF-8) |
| `xlsx` | Converter para texto/tabular (em breve) |

> Por ora, apenas **CSV** é processado de ponta a ponta no N8N. XLSX é aceito no upload, mas o workflow retorna erro até a extração tabular ser implementada.

### 5. Code — Chunking
Dividir texto em trechos de ~800 tokens com overlap de 80 tokens.

Lógica simples (caracteres, ~4 chars/token):
- `chunkSize = 3200` caracteres
- `overlap = 320` caracteres
- Numerar `chunkIndex` a partir de 0

### 6. Loop — Gerar embeddings
Para cada chunk:
```
POST https://api.openai.com/v1/embeddings
Body: { "model": "text-embedding-3-small", "input": "{{ chunk.content }}" }
```
Guardar array de 1536 floats.

Atualizar progresso periodicamente:
```
PUT .../files/{{ fileId }}
{ "progress": 45 }  // 45% após chunking, 80% após embeddings
```

### 7. HTTP — Salvar chunks
```
POST {API_URL}/api/knowledge/files/{{ fileId }}/chunks
Body: {
  "chunks": [
    {
      "content": "Trecho do documento...",
      "chunkIndex": 0,
      "embedding": [0.012, -0.034, ...]
    }
  ]
}
```
Enviar em lotes de 20–50 chunks se necessário.

### 8. HTTP — Finalizar
```
PUT {API_URL}/api/knowledge/files/{{ fileId }}
Body: {
  "status": "ready",
  "chunks": 42,
  "vectors": 42,
  "indexedAt": "2025-06-19T12:00:00.000Z"
}
```

### 9. Em caso de erro (Error Trigger ou Catch)
```
PUT {API_URL}/api/knowledge/files/{{ fileId }}
Body: {
  "status": "error",
  "errorMessage": "Descrição clara do erro"
}
```

## Formato do embedding

- Modelo: `text-embedding-3-small`
- Dimensão: **1536** (obrigatório — pgvector `vector(1536)`)
- Formato no callback: array JSON de números

## Teste end-to-end

1. Backend: `MOCK_RAG=false`
2. Upload de arquivo `.csv` pequeno no frontend
3. Acompanhar status: `uploading` → `processing` → `ready`
4. Testar Workflow 04 com query relacionada ao conteúdo

## Teste manual

```bash
curl -X POST http://localhost:5678/webhook/knowledge-file-processing \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: dev-n8n-secret" \
  -d '{"fileId":"<uuid>","agentId":"<uuid>","storageUrl":"s3://userId/arquivo.csv","downloadUrl":"https://...","fileType":"csv"}'
```

## Dependências

- OpenAI API (embeddings)
- Backend com arquivo já salvo (upload prévio)
- pgvector no PostgreSQL

## Dica para IA no N8N

Comece com suporte a `csv`. Adicione extração de `xlsx` depois.
