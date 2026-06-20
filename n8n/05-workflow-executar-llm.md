# Workflow 05 — Executar LLM

## O que criar

Workflow com webhook que recebe uma conversa montada e retorna a resposta do modelo de linguagem.

## Por que existe

É o coração da inteligência do FlowAssist. O backend chama este workflow quando `MOCK_AI=false` e o usuário envia mensagem no chat interno (`personalUse`). Também é reutilizado como sub-workflow pelo WhatsApp (Workflow 01).

**Prioridade:** criar este workflow primeiro — permite testar chat sem WhatsApp.

## Trigger

- **Tipo:** Webhook (POST)
- **Path:** `personal-use-chat`
- **URL completa:** `{N8N_URL}/webhook/personal-use-chat`
- **Quem chama:** Backend (`llm.client.ts` → `generateReply()`)

## Segurança

Primeiro node após Webhook:
```
IF $headers['x-webhook-secret'] !== {N8N_WEBHOOK_SECRET}
  → Respond 401 { "error": "Unauthorized" }
```

## Payload de entrada (enviado pelo backend)

```json
{
  "systemPrompt": "Você é o assistente...\n\nDiretrizes de estilo:\n- Formalidade: equilibrado...",
  "history": [
    { "role": "user", "content": "mensagem anterior" },
    { "role": "assistant", "content": "resposta anterior" }
  ],
  "userMessage": "nova mensagem do usuário",
  "personality": {
    "temperature": 55,
    "creativity": 60,
    "formality": 65,
    "objectivity": 60,
    "technicalLevel": 70,
    "writingStyle": "detalhado",
    "emojiUsage": "nunca",
    "responseLength": "longa"
  },
  "knowledgeContext": "Trecho relevante...\n---\nOutro trecho..."
}
```

> O backend já monta `systemPrompt` com RAG incluído em `knowledgeContext`. No WhatsApp (sub-workflow), o Workflow 03 monta o prompt antes de chamar este.

## Resposta obrigatória

```json
{
  "reply": "Texto da resposta do assistente."
}
```

O backend espera exatamente o campo `reply` (string).

## Fluxo de nodes

### 1. Webhook
Method: POST, Response Mode: "Respond to Webhook".

### 2. IF — Validar secret

### 3. Code — Montar messages array
```javascript
const messages = [
  { role: "system", content: $json.systemPrompt }
];

// history já vem no formato correto
for (const msg of ($json.history || [])) {
  messages.push({ role: msg.role, content: msg.content });
}

messages.push({ role: "user", content: $json.userMessage });

return { messages, personality: $json.personality };
```

### 4. Code — Calcular parâmetros LLM
```javascript
const p = $json.personality;
const temperature = (p.temperature || 50) / 100;
const maxTokens = { curta: 256, media: 512, longa: 1024 }[p.responseLength] || 512;
return { temperature, max_tokens: maxTokens };
```

### 5. HTTP Request — OpenAI Chat Completions
```
POST https://api.openai.com/v1/chat/completions
Body: {
  "model": "gpt-4o-mini",
  "messages": {{ $json.messages }},
  "temperature": {{ $json.temperature }},
  "max_tokens": {{ $json.max_tokens }}
}
```

### 6. Code — Extrair resposta
```javascript
const reply = $json.choices[0].message.content;
return { reply };
```

### 7. Respond to Webhook
Body: `{ "reply": "{{ $json.reply }}" }`

## Tratamento de erros

Em falha da OpenAI, responder:
```json
{ "reply": "Desculpe, não consegui processar sua mensagem agora. Tente novamente." }
```
Nunca retornar erro HTTP 500 sem body — o backend precisa de `reply`.

## Teste

1. Backend `.env`: `MOCK_AI=false`, `N8N_URL` e secrets configurados
2. Ativar workflow no N8N
3. Enviar mensagem no chat interno do frontend
4. Verificar resposta real (não simulada)

## Teste manual (curl)

```bash
curl -X POST http://localhost:5678/webhook/personal-use-chat \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: dev-n8n-secret" \
  -d '{"systemPrompt":"Você é um assistente útil.","history":[],"userMessage":"Olá!","personality":{"temperature":50,"responseLength":"media"}}'
```

## Dependências

Nenhuma. **Criar primeiro.**

## Evolução futura

Adicionar node Switch por `LLM_PROVIDER` para Anthropic/Gemini mantendo saída `{ reply }`.
