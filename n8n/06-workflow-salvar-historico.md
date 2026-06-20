# Workflow 06 — Salvar Histórico

## O que criar

Sub-workflow que persiste mensagens de conversas WhatsApp no backend.

## Por que existe

O chat interno salva mensagens diretamente no backend. No WhatsApp, o fluxo é invertido: a Evolution → N8N → Evolution, e o N8N precisa registrar o histórico para o dashboard e futura recuperação de contexto.

## Trigger

- **Tipo:** Execute Workflow Trigger
- **Chamado por:** Workflow 01 (após enviar resposta)

## Entrada esperada

```json
{
  "agentId": "uuid-do-agente",
  "contactPhone": "+55 11 99999-9999",
  "contactName": "João Silva",
  "externalId": "5511999999999@s.whatsapp.net",
  "userMessage": "Olá, qual o prazo de entrega?",
  "assistantMessage": "O prazo é de 3 a 5 dias úteis."
}
```

| Campo | Descrição |
|---|---|
| `externalId` | ID único do contato no WhatsApp (`remoteJid`) |
| `contactPhone` | Telefone formatado para exibição |
| `contactName` | Nome do pushName da Evolution |

## Saída esperada

Resposta do backend (repassar ou ignorar):
```json
{
  "id": "uuid-da-conversa",
  "title": "João Silva",
  "lastMessage": "O prazo é de 3 a 5 dias úteis.",
  "lastMessageAt": "2025-06-19T12:00:00.000Z",
  "messageCount": 2
}
```

## Fluxo de nodes

### 1. Execute Workflow Trigger

### 2. HTTP Request — Salvar no backend
```
POST {API_URL}/api/conversations/internal
Headers:
  Content-Type: application/json
  x-webhook-secret: {WEBHOOK_SECRET}

Body:
{
  "agentId": "{{ $json.agentId }}",
  "channel": "whatsapp",
  "externalId": "{{ $json.externalId }}",
  "contactName": "{{ $json.contactName }}",
  "contactPhone": "{{ $json.contactPhone }}",
  "title": "{{ $json.contactName }}",
  "messages": [
    { "role": "user", "content": "{{ $json.userMessage }}" },
    { "role": "assistant", "content": "{{ $json.assistantMessage }}" }
  ]
}
```

### 3. Return
Devolver resposta do backend.

## Comportamento do backend

- Se conversa com mesmo `externalId` + `agentId` existir: **append** das mensagens
- Se não existir: **cria** nova conversa
- Atualiza `lastMessage`, `lastMessageAt`, `messageCount`
- Incrementa contador `whatsappMsgsUsed` da assinatura

## Erros

- Falha no POST: logar mas **não bloquear** o fluxo WhatsApp (mensagem já foi enviada ao cliente)
- Usar node "Continue On Fail" no HTTP Request

## Recuperação de contexto (fase 2)

Para incluir histórico no LLM (Workflow 01, passo 9):

1. Buscar conversa por `externalId` no PostgreSQL (`conversations` + `messages`)
2. Ou aguardar endpoint: `GET /api/internal/conversations/:externalId/messages`
3. Montar `history` com últimas 12 mensagens alternando user/assistant

Fase 1 pode usar `history: []` — respostas sem memória de conversa.

## Teste

Após Workflow 01 responder uma mensagem:
1. Verificar no frontend (Dashboard → conversas recentes ou Chat)
2. Ou consultar API: `GET /api/conversations` com JWT do usuário dono do agente

## Teste manual

```bash
curl -X POST http://localhost:3000/api/conversations/internal \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: dev-webhook-secret" \
  -d '{
    "agentId": "<uuid>",
    "channel": "whatsapp",
    "externalId": "5511999999999@s.whatsapp.net",
    "contactName": "Teste",
    "contactPhone": "+55 11 99999-9999",
    "messages": [
      {"role":"user","content":"Oi"},
      {"role":"assistant","content":"Olá!"}
    ]
  }'
```

## Dependências

Backend rodando. Criar antes do Workflow 01.
