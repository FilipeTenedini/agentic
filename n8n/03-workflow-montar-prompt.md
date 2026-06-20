# Workflow 03 — Montar Personalidade e Prompt

## O que criar

Sub-workflow que transforma configuração do agente + contexto RAG em `systemPrompt` e parâmetros para o LLM.

## Por que existe

O backend já monta o prompt para chat interno, mas no WhatsApp o N8N monta tudo localmente. Centralizar a lógica evita duplicação e garante consistência entre canais.

## Trigger

- **Tipo:** Execute Workflow Trigger
- **Chamado por:** Workflows 01 e 05 (WhatsApp)

## Entrada esperada

```json
{
  "agentName": "Assistente FlowAssist",
  "baseInstructions": "...",
  "basePersonality": { ... },
  "channel": {
    "useSharedPersonality": true,
    "personality": { ... },
    "instructions": "..."
  },
  "knowledgeContext": "Trecho 1...\n---\nTrecho 2..."
}
```

`knowledgeContext` é opcional (string vazia se RAG desabilitado).

## Saída esperada

```json
{
  "systemPrompt": "Você é o Assistente...\n\nDiretrizes...",
  "personality": { ... },
  "llmParams": {
    "temperature": 0.55,
    "max_tokens": 1024,
    "top_p": 0.9
  }
}
```

## Lógica (implementar no node Code)

### 1. Resolver personalidade

```
SE channel.useSharedPersonality === true
  ENTÃO personality = basePersonality
SENÃO
  personality = channel.personality
```

### 2. Montar systemPrompt

Concatenar nesta ordem:

1. `baseInstructions`
2. `channel.instructions` (se não vazio)
3. Bloco de diretrizes de estilo (traduzir personality em texto):
   - Formalidade: baixa/média/alta (baseado em 0–100)
   - Objetividade, nível técnico, estilo de escrita
   - Uso de emoji: nunca / às vezes / frequente
   - Tamanho de resposta: curta / média / longa
4. Se `knowledgeContext` não vazio:
   ```
   ## Base de conhecimento relevante
   {knowledgeContext}
   
   Use apenas as informações acima quando pertinentes. Se não souber, diga que não tem a informação.
   ```

### 3. Mapear personality → llmParams

| Campo | Conversão |
|---|---|
| `temperature` | `temperature / 100` (0.0–1.0) |
| `creativity` | `top_p = 0.5 + (creativity / 200)` |
| `responseLength` | curta=256, media=512, longa=1024 → `max_tokens` |

## Fluxo de nodes

1. Execute Workflow Trigger
2. Code — aplicar lógica acima
3. Return — `{ systemPrompt, personality, llmParams }`

## Exemplo de trecho do systemPrompt

```
Você é o assistente virtual da empresa X.

Instruções do canal WhatsApp:
Seja breve e direto.

Diretrizes de estilo:
- Formalidade: equilibrado
- Objetividade: alta
- Estilo: detalhado
- Emojis: nunca
- Respostas: curtas

## Base de conhecimento relevante
O prazo de entrega é de 3 a 5 dias úteis...
```

## Teste

Entrada com `useSharedPersonality: false` e personalidade do canal diferente da base — verificar que a personalidade resolvida é a do canal.

Entrada com `knowledgeContext` preenchido — verificar bloco RAG no prompt.

## Dependências

Nenhuma (lógica pura). Criar após Workflow 02.
