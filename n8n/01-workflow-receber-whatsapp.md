# Workflow 01 — Receber Mensagem WhatsApp

## O que criar

Workflow orquestrador que recebe mensagens da Evolution API e produz uma resposta no WhatsApp.

## Por que existe

Mensagens WhatsApp **não passam pelo frontend**. A Evolution API envia eventos direto ao N8N. Este workflow é o ponto de entrada do canal `whatsapp` e coordena os sub-workflows 02–06.

## Trigger

- **Tipo:** Webhook (POST)
- **Origem:** Evolution API — evento `messages.upsert` (ou equivalente)
- **URL:** configurar na Evolution apontando para este workflow
- **Não é chamado pelo backend**

## Fluxo de nodes (ordem sugerida)

### 1. Webhook
Recebe payload bruto da Evolution. Campos típicos:
- `instance` ou `instanceName`
- `data.key.remoteJid` — ID do contato (ex.: `5511999999999@s.whatsapp.net`)
- `data.pushName` — nome do contato
- `data.message` — conteúdo (texto, áudio, imagem)

### 2. IF — Filtrar mensagens próprias
Ignorar se `data.key.fromMe === true` (evita loop).

### 3. Code — Extrair mensagem
Normalizar para objeto fixo:

```json
{
  "instanceName": "flowassist-a1b2c3d4",
  "contactPhone": "5511999999999@s.whatsapp.net",
  "contactName": "João Silva",
  "message": "texto da mensagem"
}
```

Suportar:
- Texto: `message.conversation` ou `message.extendedTextMessage.text`
- Áudio: transcrever (Whisper) ou ignorar com resposta padrão
- Imagem: OCR opcional (fase 2)

### 4. Code — Resolver agentId
Padrão do backend: `instanceName = "flowassist-" + agentId[0:8]`

Opções:
- Extrair os 8 chars e buscar agente no PostgreSQL (`whatsapp_connections.instance_name`)
- Ou consultar tabela `agents` via SQL

Saída: `{ agentId, instanceName, contactPhone, contactName, message }`

### 5. Execute Workflow → **02** (Buscar agente)
Entrada: `{ agentId, channelId: "whatsapp" }`
Saída: configuração completa do agente e canal.

### 6. IF — Canal habilitado?
Se `channel.enabled === false`, encerrar sem resposta.

### 7. Execute Workflow → **04** (Buscar conhecimento)
Somente se `channel.useSharedKnowledgeBase === true`.
Entrada: `{ agentId, query: message, topK: 5 }`
Saída: `{ hits: [...] }`

Montar `knowledgeContext` concatenando hits:
```
Trecho 1...
---
Trecho 2...
```

### 8. Execute Workflow → **03** (Montar prompt)
Entrada: dados do Workflow 02 + `knowledgeContext`
Saída: `{ systemPrompt, personality, llmParams }`

### 9. Execute Workflow → **05** (Executar LLM)
Montar payload:
```json
{
  "systemPrompt": "...",
  "history": [],
  "userMessage": "{{ message }}",
  "personality": { ... },
  "knowledgeContext": "..."
}
```

> Histórico: idealmente buscar conversa anterior por `externalId`. Fase 1 pode usar `history: []`; fase 2 consultar backend ou PostgreSQL.

Saída: `{ reply: "..." }`

### 10. HTTP Request — Enviar resposta (Evolution API)
```
POST {EVOLUTION_API_URL}/message/sendText/{instanceName}
Header: apikey: {EVOLUTION_API_KEY}
Body: { "number": "5511999999999", "text": "{{ reply }}" }
```

### 11. Execute Workflow → **06** (Salvar histórico)
Entrada:
```json
{
  "agentId": "...",
  "contactPhone": "...",
  "contactName": "...",
  "externalId": "5511999999999@s.whatsapp.net",
  "userMessage": "...",
  "assistantMessage": "..."
}
```

## Erros

- Falha no LLM: enviar mensagem de fallback ("Desculpe, tive um problema...")
- Falha na Evolution: logar e não chamar Workflow 06

## Teste manual

1. Evolution conectada com instância `flowassist-xxxxxxxx`
2. Enviar mensagem de outro número
3. Verificar resposta no WhatsApp
4. Verificar conversa em `POST /api/conversations/internal` refletida no frontend

## Dependências

Criar antes: Workflows **02, 03, 04, 05, 06**.
