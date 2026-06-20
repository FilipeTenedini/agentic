# Workflow 04 — Buscar Conhecimento (RAG)

## O que criar

Sub-workflow de busca semântica na base de conhecimento de um agente.

## Por que existe

Quando `useSharedKnowledgeBase=true`, o agente precisa de trechos relevantes dos documentos antes de responder. No chat interno o backend pode incluir `knowledgeContext` no payload; no WhatsApp o N8N busca diretamente.

## Trigger

- **Tipo:** Execute Workflow Trigger
- **Chamado por:** Workflow 01 (e futuramente outros)

## Entrada esperada

```json
{
  "agentId": "uuid",
  "query": "qual o prazo de entrega?",
  "topK": 5,
  "useSharedKnowledgeBase": true
}
```

## Saída esperada

```json
{
  "hits": [
    {
      "content": "O prazo de entrega é de 3 a 5 dias úteis...",
      "score": 0.92,
      "fileId": "uuid",
      "chunkIndex": 3
    }
  ],
  "knowledgeContext": "O prazo de entrega...\n---\nOutro trecho..."
}
```

## Quando executar

```
SE useSharedKnowledgeBase === false → retornar { hits: [], knowledgeContext: "" }
SENÃO → executar busca
```

## Fluxo de nodes

### 1. Execute Workflow Trigger

### 2. IF — RAG habilitado?
Se `useSharedKnowledgeBase` é false, pular para Return vazio.

### 3. HTTP Request — Gerar embedding da query
```
POST https://api.openai.com/v1/embeddings
Authorization: Bearer {OPENAI_API_KEY}
Body: {
  "model": "text-embedding-3-small",
  "input": "{{ $json.query }}"
}
```
Extrair `data[0].embedding` (array de 1536 floats).

### 4. PostgreSQL — Busca vetorial
```sql
SELECT content, file_id, chunk_index,
       1 - (embedding <=> $1::vector) AS score
FROM knowledge_chunks
WHERE agent_id = $2
ORDER BY embedding <=> $1::vector
LIMIT $3
```

Parâmetros:
- `$1` — embedding da query como literal `[0.1,0.2,...]`
- `$2` — `agentId`
- `$3` — `topK` (default 5)

> Requer extensão `pgvector` habilitada (já configurada no docker-compose do backend).

### 5. Code — Montar knowledgeContext
Filtrar hits com `score < 0.7` (threshold ajustável).
Concatenar com `\n---\n`.

### 6. Return

## Alternativa sem PostgreSQL

Endpoint atual exige JWT: `POST /api/knowledge/search`.
Para N8N, **busca direta no PostgreSQL é recomendada**.

Endpoint futuro sugerido: `POST /api/internal/knowledge/search` com `agentId` + webhook secret.

## Modelo de embedding

- **Indexação (Workflow 07):** `text-embedding-3-small`, 1536 dims
- **Busca (este workflow):** mesmo modelo — obrigatório para compatibilidade

## Teste

Pré-requisito: arquivo processado com status `ready` (Workflow 07).

Entrada:
```json
{
  "agentId": "<uuid>",
  "query": "prazo de entrega",
  "topK": 3,
  "useSharedKnowledgeBase": true
}
```

Verificar hits com conteúdo relevante e scores decrescentes.

## Dependências

- Workflow **07** executado ao menos uma vez (chunks no banco)
- Credencial PostgreSQL no N8N
- Credencial OpenAI no N8N
