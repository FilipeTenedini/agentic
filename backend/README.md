# FlowAssist — Backend

API REST do FlowAssist. **Express + TypeScript + Prisma + PostgreSQL**, organizada em
MVC modular por contexto (`auth`, `agents`, `knowledge`, `chats`, `subscriptions`,
`webhooks`).

O backend roda 100% standalone por padrao (via "mock mode"): chat, processamento de
arquivos (RAG) e conexao de WhatsApp sao simulados internamente. Desligando as flags
`MOCK_*`, os clientes passam a chamar N8N / LLM / Evolution API reais. Veja
[`documentation/BACKEND-INTEGRACAO.md`](../documentation/BACKEND-INTEGRACAO.md) para o
que precisa existir no N8N.

## Pre-requisitos

- Node.js 18+
- Docker (para o PostgreSQL com pgvector) ou um PostgreSQL proprio

## Como rodar

```bash
# 1. Subir o PostgreSQL (com pgvector)
docker compose up -d

# 2. Instalar dependencias
npm install

# 3. Configurar o ambiente
cp .env.example .env   # ajuste se necessario

# 4. Gerar o Prisma Client e criar as tabelas
npm run prisma:generate
npm run prisma:migrate   # cria a migration inicial

# 5. Popular dados de demonstracao (usuario demo, agente, conversas, etc.)
npm run db:seed

# 6. Subir a API em modo dev
npm run dev
```

A API sobe em `http://localhost:3000`. Healthcheck em `GET /health`.

**Credenciais demo** (criadas pelo seed): `demo@flowassist.com` / `demo1234`.

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Sobe a API com hot-reload (tsx) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Roda o build de producao |
| `npm run prisma:migrate` | Cria/aplica migrations em dev |
| `npm run prisma:deploy` | Aplica migrations em producao |
| `npm run db:seed` | Popula dados de demonstracao |
| `npm run prisma:studio` | Abre o Prisma Studio |

## Estrutura

```
src/
├── config/env.ts            # validacao de env + feature flags
├── infra/
│   ├── prisma.ts            # PrismaClient singleton + pgvector
│   ├── http/                # server + tratamento de erros
│   └── integrations/        # clientes n8n / llm / storage / whatsapp (mock mode)
├── shared/
│   ├── middlewares/         # auth, webhook-auth, validate, async-handler
│   └── utils/               # jwt, password, http
├── modules/                 # contextos: auth, agents, knowledge, chats, subscriptions, webhooks
├── routes.ts                # agrega todas as rotas em /api
└── index.ts                 # entrypoint
```

## Variaveis de ambiente

Veja [`.env.example`](./.env.example) — todas as variaveis estao documentadas la.
