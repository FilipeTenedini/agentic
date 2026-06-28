# Workflow 3 — Personal Use Chat (LLM)

> **Status:** Concluído (revisar se necessário)  
> **Path:** `personal-use-chat`  
> **Quem chama:** Backend (`llm.client.ts` → `generateReply()`)

Gera resposta do assistente. **Não faz embedding** — o backend já envia `systemPrompt` com RAG.

---

## Fluxo

```
Webhook → validar secret → IF → preparar prompt → Basic LLM Chain → extrair → Respond 200
```

---

## Node 1 — Webhook

| Parâmetro | Valor |
|-----------|-------|
| HTTP Method | POST |
| Path | `personal-use-chat` |
| Response Mode | **Using 'Respond to Webhook' Node** |

---

## Node 2 — Code `validar secret`

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

## Node 3 — IF → Respond 401 (se não autorizado)

---

## Node 4 — Code `preparar prompt`

```javascript
const raw = $input.first().json;
const body = raw.body ?? raw;
const p = body.personality || {};

const systemPrompt = body.systemPrompt || 'Voce e um assistente util. Responda em portugues.';

const history = [...(body.history || [])];
const last = history[history.length - 1];
if (last?.role === 'user' && body.userMessage && last.content === body.userMessage) {
  history.pop();
}

const historyLines = history.map((msg) => {
  const label = msg.role === 'assistant' ? 'Assistente' : 'Usuario';
  return `${label}: ${msg.content}`;
});

let userPrompt = '';
if (historyLines.length) {
  userPrompt += 'Historico da conversa:\n' + historyLines.join('\n') + '\n\n';
}
userPrompt += 'Pergunta atual:\n' + (body.userMessage || '');

const temperature = (p.temperature ?? 50) / 100;
const maxTokens = { curta: 256, media: 512, longa: 1024 }[p.responseLength] || 512;

return [{ json: { systemPrompt, userPrompt, temperature, maxTokens } }];
```

---

## Node 5 — Basic LLM Chain

| Campo | Valor |
|-------|-------|
| System Message | `={{ $('preparar prompt').item.json.systemPrompt }}` |
| Prompt (User) | `={{ $('preparar prompt').item.json.userPrompt }}` |

**Sub-node Model:** Groq / Ollama Chat (não OpenAI obrigatório)

| Campo | Valor |
|-------|-------|
| Temperature | `={{ $('preparar prompt').item.json.temperature }}` |
| Max Tokens | `={{ $('preparar prompt').item.json.maxTokens }}` |

---

## Node 6 — Code `extrair resposta`

```javascript
let reply = 'Desculpe, nao consegui processar sua mensagem agora. Tente novamente.';
const raw = $input.first().json;
const content = raw.text ?? raw.output ?? raw.response?.text;
if (content && String(content).trim()) {
  reply = String(content).trim();
}
return [{ json: { reply } }];
```

---

## Node 7 — Respond to Webhook

| Parâmetro | Valor |
|-----------|-------|
| Response Body | `={{ { reply: $json.reply } }}` |
| Response Code | 200 |

---

## Payload do backend (referência)

```json
{
  "systemPrompt": "... inclui base de conhecimento ...",
  "history": [{ "role": "user", "content": "..." }],
  "userMessage": "nova mensagem",
  "personality": { "temperature": 50, "responseLength": "media" },
  "knowledgeContext": ""
}
```

> `knowledgeContext` já está dentro de `systemPrompt`.

---

## Teste

```bash
curl -X POST "https://SEU-N8N.app.n8n.cloud/webhook/personal-use-chat" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: SEU_SECRET" \
  -d '{"systemPrompt":"Assistente util.","history":[],"userMessage":"oi","personality":{"temperature":50,"responseLength":"media"}}'
```

---

## Checklist

- [ ] Workflow **Active**
- [ ] `MOCK_AI=false` no backend
- [ ] Responde `{ "reply": "..." }` (nunca body vazio)
