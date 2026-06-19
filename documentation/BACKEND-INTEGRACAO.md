# FlowAssist — Backend & Integração N8N

> Documento técnico escrito para o desenvolvedor backend (pode ser júnior). Aqui está **tudo** que precisa ser construído no servidor, no N8N e no banco de dados para que a plataforma funcione de verdade. Leia do começo ao fim antes de codar qualquer coisa.

---

## Sumário

1. [Visão geral do sistema](#1-visão-geral-do-sistema)
2. [Stack recomendada](#2-stack-recomendada)
3. [Banco de dados](#3-banco-de-dados)
4. [Módulos do backend](#4-módulos-do-backend)
   - [4.1 Autenticação](#41-autenticação)
   - [4.2 Agentes e configuração](#42-agentes-e-configuração)
   - [4.3 Base de Conhecimento (RAG)](#43-base-de-conhecimento-rag)
   - [4.4 Conversas (Chat Interno)](#44-conversas-chat-interno)
   - [4.5 WhatsApp](#45-whatsapp)
   - [4.6 Assinaturas e planos](#46-assinaturas-e-planos)
5. [API REST — Endpoints necessários](#5-api-rest--endpoints-necessários)
6. [Integração com N8N](#6-integração-com-n8n)
   - [6.1 Papel do N8N no sistema](#61-papel-do-n8n-no-sistema)
   - [6.2 Workflows necessários](#62-workflows-necessários)
   - [6.3 O que o N8N precisa expor para o frontend/backend](#63-o-que-o-n8n-precisa-expor-para-o-frontenbackend)
7. [Como o frontend se conecta ao backend](#7-como-o-frontend-se-conecta-ao-backend)
8. [Como o frontend se conecta ao N8N](#8-como-o-frontend-se-conecta-ao-n8n)
9. [Segurança](#9-segurança)
10. [Variáveis de ambiente](#10-variáveis-de-ambiente)
11. [Ordem de implementação sugerida](#11-ordem-de-implementação-sugerida)

---

## 1. Visão geral do sistema

O FlowAssist é composto por **três partes** que precisam conversar entre si:

```
┌───────────────────────┐
│   Frontend (React)    │  ← O que o usuário vê no navegador
│   (já implementado)   │
└──────────┬────────────┘
           │  HTTP/REST + WebSocket
           ▼
┌───────────────────────┐
│   Backend (API)       │  ← Você vai construir isso aqui
│   Autenticação        │
│   Dados dos agentes   │
│   Arquivos/RAG        │
│   Webhooks            │
└──────────┬────────────┘
           │  HTTP (webhooks + chamadas)
           ▼
┌───────────────────────┐
│   N8N                 │  ← Motor de automação dos agentes
│   Workflows           │
│   Chamadas ao LLM     │
│   Integração WhatsApp │
└───────────────────────┘
```

**Resumindo o fluxo de uma mensagem de WhatsApp:**

1. Cliente manda mensagem no WhatsApp.
2. WhatsApp entrega a mensagem para o N8N via webhook.
3. N8N busca as configurações do agente no Backend.
4. N8N busca contexto relevante na Base de Conhecimento (RAG).
5. N8N monta o prompt e chama o LLM (ex.: OpenAI, Groq, etc.).
6. N8N responde automaticamente ao cliente no WhatsApp.
7. N8N registra a conversa no Backend.

**Resumindo o fluxo de uma mensagem no chat interno (Uso Pessoal):**

1. Usuário digita no chat do FlowAssist.
2. Frontend envia a mensagem para o Backend.
3. Backend encaminha para o N8N via HTTP.
4. N8N busca configurações e contexto, chama LLM, retorna resposta.
5. Backend salva a mensagem e retorna para o Frontend.

---

## 2. Stack recomendada

> Não é obrigatório usar exatamente essa stack, mas é o que melhor se encaixa com o frontend React já existente e com o N8N.

| Camada | Tecnologia sugerida | Por quê |
| --- | --- | --- |
| Linguagem | **Node.js + TypeScript** | Mesma linguagem do frontend, menos curva de aprendizado |
| Framework HTTP | **Fastify** ou **Express** | Simples, bem documentado, fácil de escalar |
| Banco de dados principal | **PostgreSQL** | Confiável, suporta JSON, tem bom suporte a busca vetorial (pgvector) |
| ORM | **Prisma** | Tipagem automática, migrations fáceis |
| Armazenamento de arquivos | **Supabase Storage** ou **AWS S3** | Guardar PDFs e arquivos da base de conhecimento |
| Autenticação | **JWT** (JSON Web Tokens) | Stateless, fácil de integrar com frontend |
| Embeddings/Vetores | **pgvector** (extensão do PostgreSQL) | Armazenar e buscar vetores de texto para o RAG |
| Modelo de linguagem | **OpenAI API** (GPT-4o / GPT-4o-mini) ou **Groq** | LLM chamado pelo N8N |
| WhatsApp | **Evolution API** | API open-source para WhatsApp, funciona muito bem com N8N |
| Motor de automação | **N8N** (self-hosted) | Orquestra tudo sem precisar de código extra |
| Cache/filas | **Redis** (opcional, fase 2) | Para filas de processamento de arquivos volumosos |

---

## 3. Banco de dados

Abaixo estão **todas as tabelas** que o banco de dados precisa ter. Pensa assim: cada tabela é uma gaveta onde a gente guarda um tipo de coisa.

### Tabela: `users` (usuários)

```sql
users
├── id              UUID PRIMARY KEY
├── email           TEXT UNIQUE NOT NULL
├── password_hash   TEXT NOT NULL          -- nunca salvar senha em texto puro
├── name            TEXT NOT NULL
├── avatar_url      TEXT
├── created_at      TIMESTAMP DEFAULT NOW()
└── updated_at      TIMESTAMP DEFAULT NOW()
```

### Tabela: `agents` (configuração do agente de cada usuário)

Cada usuário tem **um** agente. O agente tem canais (WhatsApp e Uso Pessoal).

```sql
agents
├── id              UUID PRIMARY KEY
├── user_id         UUID REFERENCES users(id)
├── name            TEXT NOT NULL            -- nome do agente ("Assistente FlowAssist")
├── description     TEXT
├── status          TEXT DEFAULT 'draft'     -- 'draft' | 'active' | 'paused'
├── base_instructions TEXT                   -- instruções globais em texto livre
├── created_at      TIMESTAMP DEFAULT NOW()
└── updated_at      TIMESTAMP DEFAULT NOW()
```

### Tabela: `channel_configs` (configuração por canal)

Cada agente tem até dois canais: `whatsapp` e `personal_use`.

```sql
channel_configs
├── id                   UUID PRIMARY KEY
├── agent_id             UUID REFERENCES agents(id)
├── channel_id           TEXT NOT NULL     -- 'whatsapp' | 'personal_use'
├── enabled              BOOLEAN DEFAULT false
├── instructions         TEXT DEFAULT ''   -- instruções específicas do canal
├── personality          JSONB             -- objeto AgentPersonality (ver seção 4.2)
├── use_shared_knowledge BOOLEAN DEFAULT true
├── created_at           TIMESTAMP DEFAULT NOW()
└── updated_at           TIMESTAMP DEFAULT NOW()

-- Restrição: um canal por agente
UNIQUE (agent_id, channel_id)
```

O campo `personality` é um JSON com essa estrutura:

```json
{
  "temperature": 50,
  "creativity": 50,
  "formality": 60,
  "objectivity": 55,
  "technicalLevel": 40,
  "writingStyle": "equilibrado",
  "emojiUsage": "as_vezes",
  "responseLength": "media"
}
```

### Tabela: `whatsapp_connections` (dados da conexão WhatsApp)

```sql
whatsapp_connections
├── id                UUID PRIMARY KEY
├── agent_id          UUID REFERENCES agents(id) UNIQUE
├── phone_number      TEXT
├── instance_name     TEXT                 -- nome da instância na Evolution API
├── connection_status TEXT DEFAULT 'disconnected'
           -- 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
├── connected_at      TIMESTAMP
├── qr_code           TEXT                 -- QR code em base64 para escanear
└── updated_at        TIMESTAMP DEFAULT NOW()
```

### Tabela: `knowledge_files` (arquivos da base de conhecimento)

```sql
knowledge_files
├── id            UUID PRIMARY KEY
├── agent_id      UUID REFERENCES agents(id)
├── name          TEXT NOT NULL
├── type          TEXT                     -- 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'image' | 'other'
├── size_bytes    INTEGER
├── status        TEXT DEFAULT 'uploading' -- 'uploading' | 'processing' | 'ready' | 'error'
├── error_message TEXT
├── storage_url   TEXT                     -- URL no S3/Supabase Storage
├── chunks        INTEGER                  -- quantidade de pedaços gerados no RAG
├── vectors       INTEGER                  -- quantidade de vetores gerados
├── indexed_at    TIMESTAMP                -- quando ficou pronto para busca
├── uploaded_at   TIMESTAMP DEFAULT NOW()
└── updated_at    TIMESTAMP DEFAULT NOW()
```

### Tabela: `knowledge_chunks` (pedaços de texto para RAG)

Cada arquivo é dividido em pedaços menores. Cada pedaço tem um vetor numérico para busca semântica.

```sql
knowledge_chunks
├── id           UUID PRIMARY KEY
├── file_id      UUID REFERENCES knowledge_files(id)
├── agent_id     UUID REFERENCES agents(id)
├── content      TEXT                     -- o texto do trecho
├── embedding    vector(1536)             -- vetor (requer extensão pgvector)
├── chunk_index  INTEGER                  -- posição dentro do arquivo
└── created_at   TIMESTAMP DEFAULT NOW()
```

> **Nota:** Para usar `vector(1536)`, precisa rodar `CREATE EXTENSION IF NOT EXISTS vector;` no PostgreSQL.

### Tabela: `conversations` (conversas)

```sql
conversations
├── id              UUID PRIMARY KEY
├── agent_id        UUID REFERENCES agents(id)
├── channel_id      TEXT               -- 'whatsapp' | 'personal_use'
├── external_id     TEXT               -- ID da conversa no WhatsApp (quando aplicável)
├── contact_name    TEXT               -- nome do contato (WhatsApp)
├── contact_phone   TEXT               -- número do contato (WhatsApp)
├── title           TEXT               -- resumo/título gerado
├── message_count   INTEGER DEFAULT 0
├── last_message    TEXT
├── last_message_at TIMESTAMP
├── created_at      TIMESTAMP DEFAULT NOW()
└── updated_at      TIMESTAMP DEFAULT NOW()
```

### Tabela: `messages` (mensagens dentro de cada conversa)

```sql
messages
├── id              UUID PRIMARY KEY
├── conversation_id UUID REFERENCES conversations(id)
├── role            TEXT NOT NULL   -- 'user' | 'assistant'
├── content         TEXT NOT NULL
├── created_at      TIMESTAMP DEFAULT NOW()
```

### Tabela: `subscriptions` (assinaturas e planos)

```sql
subscriptions
├── id               UUID PRIMARY KEY
├── user_id          UUID REFERENCES users(id) UNIQUE
├── plan_id          TEXT DEFAULT 'free'   -- 'free' | 'starter' | 'pro' | 'business'
├── plan_name        TEXT
├── price            DECIMAL(10,2)
├── currency         TEXT DEFAULT 'BRL'
├── status           TEXT DEFAULT 'active' -- 'active' | 'past_due' | 'canceled'
├── renewal_date     DATE
├── whatsapp_msgs_used INTEGER DEFAULT 0
├── whatsapp_msgs_max  INTEGER DEFAULT 100
├── chat_msgs_used     INTEGER DEFAULT 0
├── chat_msgs_max      INTEGER DEFAULT 50
├── created_at       TIMESTAMP DEFAULT NOW()
└── updated_at       TIMESTAMP DEFAULT NOW()
```

---

## 4. Módulos do backend

### 4.1 Autenticação

**O que precisa existir:**

- **Registro:** o usuário cria uma conta com email + senha.
- **Login:** o usuário entra com email + senha e recebe um **token JWT**.
- **Token:** o frontend guarda esse token e manda em todas as requisições no cabeçalho `Authorization: Bearer <token>`.
- **Verificação:** em cada rota protegida, o backend verifica se o token é válido.
- **Logout:** o frontend simplesmente descarta o token (não precisa de endpoint, mas pode ter uma lista de tokens inválidos/blacklist para invalidar tokens antes do vencimento).

**Regras:**
- A senha nunca é salva em texto puro. Usar **bcrypt** para criar um hash.
- O token JWT deve expirar em 7 dias.
- O token deve conter: `{ userId, email, iat, exp }`.

**Endpoints:**

```
POST /auth/register    → cria usuário, retorna token
POST /auth/login       → valida email+senha, retorna token
GET  /auth/me          → retorna dados do usuário logado (exige token)
POST /auth/logout      → (opcional) invalida token
```

---

### 4.2 Agentes e configuração

**O que precisa existir:**

- Cada usuário tem exatamente um agente.
- Ao se cadastrar, o backend cria automaticamente o agente e os dois registros de canal (`whatsapp` e `personal_use`) com valores padrão.
- O usuário pode editar as configurações do agente (nome, instruções, personalidade por canal).

**Regras:**
- Antes de salvar, validar que os campos obrigatórios estão preenchidos.
- A `personality` do canal é um JSON livre, mas deve respeitar os campos definidos em `AgentPersonality` (ver seção 3).
- O campo `instructions` aceita texto longo (sem limite rígido, mas sugerir máximo de 5.000 caracteres na UI).

**Endpoints:**

```
GET  /agent                          → busca o agente do usuário logado
PUT  /agent                          → atualiza nome, descrição, status, base_instructions
GET  /agent/channels                 → lista as duas configs de canal (whatsapp + personal_use)
PUT  /agent/channels/:channelId      → atualiza config de um canal (enabled, instructions, personality)
GET  /agent/whatsapp/status          → retorna status atual da conexão WhatsApp
POST /agent/whatsapp/connect         → inicia conexão (cria instância na Evolution API)
POST /agent/whatsapp/disconnect      → desconecta e remove instância
GET  /agent/whatsapp/qr              → retorna QR code atual para escanear
```

---

### 4.3 Base de Conhecimento (RAG)

**O que precisa existir:**

- Upload de arquivos (PDF, DOCX, TXT, CSV, XLSX, imagens).
- Armazenamento do arquivo no S3/Supabase Storage.
- Processamento assíncrono: após o upload, o arquivo passa por:
  1. Extração de texto (PDF → texto, DOCX → texto, etc.).
  2. Divisão em pedaços (chunks) de ~500 tokens.
  3. Geração de embeddings (vetores numéricos) para cada chunk via API de embeddings (OpenAI `text-embedding-3-small` ou similar).
  4. Armazenamento dos vetores na tabela `knowledge_chunks`.
- Busca semântica: dado um texto de pergunta, encontrar os chunks mais parecidos por similaridade vetorial.

**Fluxo de upload:**

```
Frontend → POST /knowledge/files (multipart/form-data)
  ↓
Backend salva arquivo no S3
  ↓
Backend cria registro na tabela knowledge_files (status: 'uploading')
  ↓
Backend dispara processamento assíncrono (fila ou job)
  ↓
  [status: 'processing']
  ↓
Extração de texto + chunking + embeddings
  ↓
  [status: 'ready'] ou [status: 'error']
  ↓
Frontend consulta GET /knowledge/files para ver o status atualizado
```

> **Nesta fase (MVP):** o processamento pode ser síncrono e simulado (apenas muda o status sem processar de verdade). O importante é ter a estrutura pronta para a integração real depois.

**Endpoints:**

```
GET    /knowledge/files                → lista todos os arquivos do agente
POST   /knowledge/files               → faz upload de um arquivo (multipart)
DELETE /knowledge/files/:fileId       → remove arquivo e seus chunks
POST   /knowledge/files/:fileId/retry → tenta processar novamente um arquivo com erro
GET    /knowledge/files/:fileId       → detalhe de um arquivo com status atualizado
```

**Função de busca semântica (usada pelo N8N):**

```
POST /knowledge/search
Body: { "query": "texto da pergunta", "topK": 5 }
Response: [{ content, score, fileId, chunkIndex }]
```

> Esta rota é chamada pelo N8N antes de montar o prompt do LLM.

---

### 4.4 Conversas (Chat Interno)

**O que precisa existir:**

- O usuário inicia uma conversa no chat interno (canal `personal_use`).
- O frontend manda a mensagem para o backend.
- O backend encaminha para o N8N processar e retorna a resposta do assistente.
- O histórico de mensagens é salvo no banco.

**Endpoints:**

```
GET  /conversations                   → lista todas as conversas do agente
POST /conversations                   → cria uma nova conversa
GET  /conversations/:id               → detalhe da conversa com mensagens
DELETE /conversations/:id             → exclui uma conversa

POST /conversations/:id/messages      → envia mensagem e recebe resposta do assistente
```

**O que acontece no `POST /conversations/:id/messages`:**

```
1. Salva a mensagem do usuário no banco (role: 'user')
2. Busca o histórico das últimas N mensagens da conversa
3. Busca a configuração do agente (canal personal_use: personality, instructions)
4. Faz busca semântica na base de conhecimento (POST /knowledge/search)
5. Monta o payload e chama o N8N via HTTP
6. Aguarda a resposta do N8N (resposta do LLM)
7. Salva a resposta no banco (role: 'assistant')
8. Retorna a resposta para o frontend
```

> O passo 5 pode ser feito de duas formas:
> - **Síncrono:** o backend espera o N8N responder (mais simples, pode demorar).
> - **WebSocket / SSE:** o N8N responde de forma assíncrona e o frontend recebe em tempo real (melhor UX, mais complexo).
> Comece com o síncrono.

---

### 4.5 WhatsApp

**O que precisa existir:**

- Integração com a **Evolution API** (uma API open-source que controla o WhatsApp Web).
- O backend gerencia instâncias da Evolution API (uma instância por agente/usuário).
- O N8N recebe as mensagens do WhatsApp via webhook e processa.
- O N8N usa o backend para buscar configs e salvar conversas.

**Fluxo de conexão:**

```
1. Usuário clica "Conectar WhatsApp" no frontend.
2. Frontend chama POST /agent/whatsapp/connect.
3. Backend cria uma instância na Evolution API com um nome único.
4. Evolution API gera um QR Code.
5. Backend retorna o QR Code para o frontend exibir.
6. Usuário escaneia o QR Code com o celular.
7. Evolution API confirma a conexão via webhook no backend.
8. Backend atualiza connection_status para 'connected'.
9. Backend registra o webhook da Evolution API no N8N.
```

**Fluxo de recebimento de mensagem:**

```
1. Cliente final manda mensagem no WhatsApp do usuário.
2. Evolution API dispara webhook para o N8N.
3. N8N identifica o agente pelo número de telefone.
4. N8N chama GET /agent (no backend) para buscar configs.
5. N8N chama POST /knowledge/search para buscar contexto.
6. N8N monta o prompt e chama o LLM.
7. N8N manda a resposta de volta para o cliente via Evolution API.
8. N8N chama POST /conversations/:id/messages no backend para salvar o histórico.
```

---

### 4.6 Assinaturas e planos

**O que precisa existir:**

- Cada usuário tem um plano (`free`, `starter`, `pro`, `business`).
- Cada plano tem limites de uso (mensagens WhatsApp, mensagens chat, conversas).
- O backend verifica os limites antes de processar cada mensagem.
- O contador de uso é incrementado a cada mensagem processada.

**Endpoints:**

```
GET  /subscription           → retorna plano, status e limites de uso do usuário
PUT  /subscription           → atualiza plano (integração com pagamento, fase futura)
```

**Limites por plano (exemplo):**

| Plano | WhatsApp msgs/mês | Chat msgs/mês |
| --- | --- | --- |
| Free | 100 | 50 |
| Starter | 1.000 | 500 |
| Pro | 5.000 | 2.000 |
| Business | Ilimitado | Ilimitado |

---

## 5. API REST — Endpoints necessários

Aqui está **a lista completa** de todos os endpoints em ordem de prioridade:

### Prioridade 1 — Essencial para o MVP funcionar

```
POST   /auth/register
POST   /auth/login
GET    /auth/me

GET    /agent
PUT    /agent
GET    /agent/channels
PUT    /agent/channels/:channelId       ← :channelId = 'whatsapp' ou 'personal_use'

GET    /knowledge/files
POST   /knowledge/files                 ← multipart/form-data
DELETE /knowledge/files/:fileId
POST   /knowledge/search               ← chamada interna do N8N

GET    /conversations
POST   /conversations
GET    /conversations/:id
POST   /conversations/:id/messages

GET    /subscription
```

### Prioridade 2 — WhatsApp

```
GET    /agent/whatsapp/status
POST   /agent/whatsapp/connect
POST   /agent/whatsapp/disconnect
GET    /agent/whatsapp/qr

POST   /webhooks/evolution             ← Evolution API avisa de eventos de conexão
POST   /webhooks/whatsapp-message      ← Evolution API avisa de mensagem recebida (alternativo ao N8N direto)
```

### Prioridade 3 — Complementos

```
POST   /knowledge/files/:fileId/retry
DELETE /conversations/:id
GET    /conversations/:id/messages
```

---

## 6. Integração com N8N

### 6.1 Papel do N8N no sistema

O N8N é o **motor de inteligência** da plataforma. Ele é responsável por:

1. **Receber mensagens do WhatsApp** via webhook da Evolution API.
2. **Orquestrar o fluxo de resposta:** buscar configs → buscar contexto → chamar LLM → responder.
3. **Processar mensagens do chat interno** quando chamado pelo backend.
4. **Processar arquivos** da base de conhecimento (chunking + embeddings) de forma assíncrona.

O N8N **não é** responsável por:
- Autenticar usuários.
- Gerenciar planos/assinaturas.
- Armazenar dados permanentes (isso é papel do backend + banco).

### 6.2 Workflows necessários

O desenvolvedor N8N precisa criar **4 workflows**:

---

#### Workflow 1 — Resposta ao WhatsApp

**Nome sugerido:** `whatsapp-incoming-message`

**Trigger:** Webhook — Evolution API manda um POST quando o usuário final manda mensagem.

**Passos:**

```
1. [Webhook Trigger] Recebe a mensagem
   ↓
2. [HTTP Request] GET {BACKEND_URL}/agent?phone={número}
   — busca as configs do agente pelo número do WhatsApp conectado
   ↓
3. [IF] O agente tem canal WhatsApp ativo?
   — Não → encerra (não responde)
   — Sim → continua
   ↓
4. [HTTP Request] POST {BACKEND_URL}/knowledge/search
   Body: { query: <texto da mensagem>, topK: 5 }
   — busca trechos relevantes da base de conhecimento
   ↓
5. [Code node] Monta o prompt do sistema:
   — instruções do canal WhatsApp
   — trechos da base de conhecimento como contexto
   — parâmetros de personalidade (formality, objectivity, etc.) como instrução de estilo
   ↓
6. [HTTP Request] POST para a API do LLM (ex.: OpenAI /v1/chat/completions)
   — manda histórico + prompt do sistema + mensagem do usuário
   ↓
7. [HTTP Request] POST {BACKEND_URL}/conversations/:id/messages
   — salva a mensagem do usuário e a resposta do assistente no banco
   ↓
8. [HTTP Request] POST para Evolution API
   — manda a resposta de volta para o cliente no WhatsApp
```

---

#### Workflow 2 — Resposta ao Chat Interno (Uso Pessoal)

**Nome sugerido:** `personal-use-chat`

**Trigger:** Webhook — Backend chama este endpoint quando o usuário manda mensagem no chat interno.

**Passos:**

```
1. [Webhook Trigger] Recebe { conversationId, message, agentConfig, knowledgeContext }
   — o backend já busca configs e contexto antes de chamar o N8N
   ↓
2. [Code node] Monta o prompt do sistema com as configs do canal personal_use
   ↓
3. [HTTP Request] POST para a API do LLM
   — manda o histórico + prompt do sistema + mensagem do usuário
   ↓
4. [Respond to Webhook] Retorna a resposta do LLM para o backend
```

> Neste workflow, o backend já montou o contexto e passou tudo. O N8N só precisa chamar o LLM e devolver a resposta. Isso é mais simples e rápido.

---

#### Workflow 3 — Processamento de arquivo (RAG)

**Nome sugerido:** `knowledge-file-processing`

**Trigger:** Webhook — Backend chama quando um arquivo foi uploadado e precisa ser processado.

**Passos:**

```
1. [Webhook Trigger] Recebe { fileId, storageUrl, fileType, agentId }
   ↓
2. [HTTP Request] Baixa o arquivo do storage (S3/Supabase)
   ↓
3. [Switch/IF] Por tipo de arquivo:
   — PDF → extrai texto com biblioteca/serviço de PDF parsing
   — DOCX → extrai texto
   — TXT/CSV → lê direto
   — Imagem → OCR ou descreve com LLM Vision
   ↓
4. [Code node] Divide o texto em chunks de ~500 tokens com sobreposição de ~50 tokens
   ↓
5. [Loop] Para cada chunk:
   a. [HTTP Request] POST para API de embeddings (ex.: OpenAI text-embedding-3-small)
      — gera o vetor numérico do chunk
   b. [HTTP Request] POST {BACKEND_URL}/knowledge/chunks
      — salva o chunk + vetor no banco
   ↓
6. [HTTP Request] PUT {BACKEND_URL}/knowledge/files/:fileId
   Body: { status: 'ready', chunks: N, vectors: N, indexedAt: <agora> }
   — atualiza o status do arquivo no banco
   ↓
   (Em caso de erro em qualquer passo:)
7. [HTTP Request] PUT {BACKEND_URL}/knowledge/files/:fileId
   Body: { status: 'error', errorMessage: <mensagem> }
```

---

#### Workflow 4 — Eventos de conexão WhatsApp

**Nome sugerido:** `whatsapp-connection-events`

**Trigger:** Webhook — Evolution API manda eventos de status (conectado, desconectado, QR gerado, etc.).

**Passos:**

```
1. [Webhook Trigger] Recebe evento da Evolution API
   ↓
2. [Switch] Tipo do evento:
   — 'qr' → extrai o QR code e chama PUT {BACKEND_URL}/agent/whatsapp/status
             Body: { connectionStatus: 'connecting', qrCode: <base64> }
   
   — 'open' (conectado) → chama PUT {BACKEND_URL}/agent/whatsapp/status
             Body: { connectionStatus: 'connected', phoneNumber: <número>, connectedAt: <agora> }
   
   — 'close' (desconectado) → chama PUT {BACKEND_URL}/agent/whatsapp/status
             Body: { connectionStatus: 'disconnected' }
```

---

### 6.3 O que o N8N precisa expor para o frontend/backend

O N8N precisa ter **URLs de webhook** que o backend usa para chamar os workflows. Você vai precisar configurar:

| Workflow | URL do Webhook N8N | Chamado por |
| --- | --- | --- |
| `personal-use-chat` | `{N8N_URL}/webhook/personal-use-chat` | Backend (quando usuário manda mensagem no chat) |
| `knowledge-file-processing` | `{N8N_URL}/webhook/knowledge-file-processing` | Backend (após upload de arquivo) |
| `whatsapp-incoming-message` | `{N8N_URL}/webhook/whatsapp-incoming-message` | Evolution API (mensagem WhatsApp) |
| `whatsapp-connection-events` | `{N8N_URL}/webhook/whatsapp-connection-events` | Evolution API (eventos de conexão) |

> **Importante:** Essas URLs precisam estar protegidas. O N8N permite adicionar um cabeçalho de autenticação (`x-api-key`) ou usar a autenticação básica (Basic Auth). Configure isso para que só o backend e a Evolution API possam chamar esses webhooks.

---

## 7. Como o frontend se conecta ao backend

O frontend atualmente é **100% mockado** — não faz chamadas HTTP reais. Para integrar com o backend, cada função mockada precisa ser substituída por uma chamada real.

### Onde estão os mocks no frontend

| O que está mockado | Arquivo | O que substituir por |
| --- | --- | --- |
| Login / Registro | `src/contexts/auth-context.tsx` | `POST /auth/login` e `POST /auth/register` |
| Dados do usuário logado | `src/contexts/auth-context.tsx` | `GET /auth/me` |
| Configurações do agente | `src/contexts/settings-context.tsx` | `GET /agent` e `PUT /agent` |
| Config dos canais | `src/contexts/settings-context.tsx` | `GET /agent/channels` e `PUT /agent/channels/:channelId` |
| Status WhatsApp | `src/contexts/settings-context.tsx` | `GET /agent/whatsapp/status` |
| Arquivos da base de conhecimento | `src/contexts/knowledge-base-context.tsx` | `GET /knowledge/files` e `POST /knowledge/files` |
| Conversas e mensagens | `src/contexts/chat-context.tsx` | `GET /conversations` e `POST /conversations/:id/messages` |
| Plano e assinatura | `src/mocks/subscription.ts` | `GET /subscription` |

### Padrão de integração

O frontend usa `fetch` nativo ou pode instalar **axios**. Crie um arquivo `src/lib/api.ts` centralizado:

```typescript
// src/lib/api.ts (a criar no frontend)
const BASE_URL = import.meta.env.VITE_API_URL; // ex.: http://localhost:3000

async function api(path: string, options?: RequestInit) {
  const token = localStorage.getItem('flowassist_token');
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}
```

### Variável de ambiente do frontend

Crie um arquivo `.env` na raiz do projeto frontend:

```env
VITE_API_URL=http://localhost:3000
VITE_N8N_URL=http://localhost:5678
```

---

## 8. Como o frontend se conecta ao N8N

Em geral, o frontend **não chama o N8N diretamente**. Toda comunicação é:

```
Frontend → Backend → N8N
```

A única exceção possível é se você quiser fazer streaming de resposta do LLM em tempo real no chat (SSE/WebSocket). Nesse caso:

```
Frontend → Backend → N8N → LLM (streaming) → Backend → Frontend (SSE)
```

Mas comece simples: sem streaming, tudo síncrono via backend.

---

## 9. Segurança

Regras que o desenvolvedor backend precisa seguir obrigatoriamente:

### Autenticação e autorização

- **Todas as rotas** (exceto `/auth/login` e `/auth/register`) exigem o token JWT.
- **Nunca retorne dados de outro usuário.** Antes de qualquer operação no banco, verifique se o recurso pertence ao usuário logado.
  - Exemplo: ao buscar `/agent`, o backend pega o `userId` do token, não de um parâmetro da URL.
- **Rate limiting:** limite de 100 requisições por minuto por IP para evitar abuso.

### Senhas

- Use **bcrypt** com fator de custo mínimo de 12.
- Nunca logue ou retorne o `password_hash`.

### Uploads de arquivo

- Valide o tipo do arquivo no backend (não confie só no frontend).
- Limite o tamanho de cada arquivo (sugerir máximo de 20MB).
- Armazene os arquivos no S3/Storage, nunca no servidor.

### Webhooks

- Os webhooks do N8N (`/webhooks/*`) e da Evolution API devem verificar um header secreto:
  ```
  x-webhook-secret: <valor configurado no .env>
  ```

### Tokens JWT

- Tempo de expiração: 7 dias.
- O segredo JWT (`JWT_SECRET`) deve ter pelo menos 32 caracteres aleatórios.
- Nunca commit o `.env` no repositório.

---

## 10. Variáveis de ambiente

Crie um arquivo `.env` na raiz do backend. Estas são as variáveis obrigatórias:

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/flowassist

# Autenticação
JWT_SECRET=sua_chave_secreta_aleatoria_com_32_caracteres_no_minimo
JWT_EXPIRES_IN=7d

# Servidor
PORT=3000
NODE_ENV=development

# Storage (escolha um)
S3_BUCKET=flowassist-files
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
# OU
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=...

# LLM (escolha um)
OPENAI_API_KEY=sk-...
# OU
GROQ_API_KEY=gsk_...

# N8N
N8N_URL=http://localhost:5678
N8N_WEBHOOK_SECRET=outro_segredo_aleatorio

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=...

# Webhook secret (para verificar chamadas externas)
WEBHOOK_SECRET=mais_um_segredo
```

---

## 11. Ordem de implementação sugerida

Siga essa ordem para não se perder. Cada fase entrega algo funcionando:

### Fase 1 — Fundação (sem IA ainda)

- [ ] Configurar o projeto Node.js + TypeScript + Fastify/Express
- [ ] Conectar o PostgreSQL com Prisma
- [ ] Criar as migrations de todas as tabelas (seção 3)
- [ ] Implementar os endpoints de autenticação (registro + login + `/auth/me`)
- [ ] Criar o agente e as configs de canal automaticamente no registro
- [ ] Implementar os endpoints de agente (`GET /agent`, `PUT /agent`, `PUT /agent/channels/:channelId`)
- [ ] Testar com Insomnia/Postman

### Fase 2 — Base de conhecimento

- [ ] Configurar S3 ou Supabase Storage
- [ ] Implementar upload de arquivos (`POST /knowledge/files`)
- [ ] Criar o workflow N8N de processamento de arquivo
- [ ] Implementar busca semântica (`POST /knowledge/search`)
- [ ] Ativar o pgvector no PostgreSQL

### Fase 3 — Chat interno com IA

- [ ] Criar o workflow N8N de chat (personal_use)
- [ ] Implementar `POST /conversations/:id/messages` chamando o N8N
- [ ] Integrar com o frontend (substituir mock do chat)

### Fase 4 — WhatsApp

- [ ] Instalar e configurar a Evolution API
- [ ] Implementar endpoints de conexão WhatsApp
- [ ] Criar o workflow N8N de mensagens WhatsApp
- [ ] Criar o workflow N8N de eventos de conexão
- [ ] Testar o fluxo completo: mensagem → resposta automática

### Fase 5 — Integrar o frontend

- [ ] Criar `src/lib/api.ts` no frontend
- [ ] Substituir cada mock por uma chamada real, começando pela autenticação
- [ ] Remover os dados mockados dos contexts
- [ ] Testar o fluxo completo end-to-end

### Fase 6 — Produção

- [ ] Deploy do backend (Railway, Render, VPS com Docker)
- [ ] Deploy do N8N (N8N Cloud ou Docker na VPS)
- [ ] Deploy da Evolution API (Docker)
- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar HTTPS (SSL) obrigatório
- [ ] Configurar backups automáticos do banco

---

## Referências rápidas

| Ferramenta | Documentação |
| --- | --- |
| N8N | https://docs.n8n.io |
| Evolution API | https://doc.evolution-api.com |
| Prisma | https://www.prisma.io/docs |
| Fastify | https://fastify.dev/docs |
| OpenAI Embeddings | https://platform.openai.com/docs/guides/embeddings |
| pgvector | https://github.com/pgvector/pgvector |
| JWT (jsonwebtoken) | https://www.npmjs.com/package/jsonwebtoken |
| bcrypt | https://www.npmjs.com/package/bcrypt |
