# Workflow 02 — Buscar Agente e Configuração

## O que criar

Sub-workflow que retorna a configuração completa de um agente para um canal específico.

## Por que existe

WhatsApp e chat interno compartilham a mesma estrutura de dados (personalidade, instruções, flags de herança), mas o WhatsApp não recebe esses dados prontos do backend — o N8N precisa montá-los consultando o banco.

## Trigger

- **Tipo:** Execute Workflow Trigger (sub-workflow)
- **Chamado por:** Workflows 01 e (opcionalmente) 05

## Entrada esperada

```json
{
  "agentId": "uuid-do-agente",
  "channelId": "whatsapp"
}
```

`channelId` aceita: `"whatsapp"` | `"personalUse"`

## Saída esperada

```json
{
  "agentId": "uuid",
  "agentName": "Assistente FlowAssist",
  "baseInstructions": "Você é o assistente da empresa...",
  "basePersonality": {
    "temperature": 50,
    "creativity": 50,
    "formality": 50,
    "objectivity": 50,
    "technicalLevel": 50,
    "writingStyle": "equilibrado",
    "emojiUsage": "as_vezes",
    "responseLength": "media"
  },
  "channel": {
    "channelId": "whatsapp",
    "enabled": true,
    "useSharedPersonality": false,
    "useSharedKnowledgeBase": true,
    "personality": { "...mesma estrutura..." },
    "instructions": "Seja breve nas respostas do WhatsApp."
  }
}
```

## Fluxo de nodes

### 1. Execute Workflow Trigger
Recebe `agentId` e `channelId`.

### 2. PostgreSQL — Buscar agente
```sql
SELECT id, name, base_instructions, base_personality
FROM agents
WHERE id = $1
```
Parâmetro: `{{ $json.agentId }}`

### 3. PostgreSQL — Buscar canal
```sql
SELECT channel_id, enabled, use_shared_personality,
       use_shared_knowledge_base, personality, instructions
FROM channel_configs
WHERE agent_id = $1 AND channel_id = $2
```

> Nomes de colunas podem ser snake_case no Prisma. Ajuste conforme schema real.

### 4. Code — Montar resposta
- Parsear JSON dos campos `base_personality` e `channel.personality` se vierem como string
- Mapear `channel_id` → `channelId` (camelCase na saída)
- Se canal não existir: retornar erro claro

### 5. Return
Devolver objeto unificado.

## Alternativa sem PostgreSQL direto

Se preferir não conectar o N8N ao banco, aguardar endpoint futuro:
`GET /api/internal/agents/:agentId` com `x-webhook-secret`.

Por ora, **PostgreSQL direto é o caminho recomendado** para WhatsApp.

## Tabelas envolvidas

| Tabela | Campos relevantes |
|---|---|
| `agents` | `id`, `name`, `base_instructions`, `base_personality` |
| `channel_configs` | `agent_id`, `channel_id`, `enabled`, flags de herança, `personality`, `instructions` |

## Teste

Entrada manual:
```json
{ "agentId": "<uuid de um agente seed>", "channelId": "whatsapp" }
```

Verificar que `channel.enabled`, personalidade e instruções batem com o que aparece no frontend em "Meu Agente".

## Dependências

Nenhuma. Pode ser o **primeiro sub-workflow** criado.
