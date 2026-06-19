---
name: Proposta v2 docs + implementação
overview: Atualizar os três documentos (PRODUTO.md, PLANEJAMENTO.md, ARQUITETURA.md) E implementar no código React/TS as mudanças correspondentes — transformar "Meu Agente" no centro de configuração do assistente com Personalidade, Base de Conhecimento (futuro RAG), configuração por canal (Uso Pessoal e WhatsApp herdando ou não a config base) e evolução do Dashboard. Tudo permanece 100% mockado, preparando a arquitetura para IA futura.
todos:
  - id: types-mocks
    content: Estender types/index.ts (AgentPersonality, KnowledgeFile/KnowledgeBase, ChannelConfig, AgentStatus, AgentSettings v2) e criar mocks (personality, knowledge-base) + DEMO_SETTINGS estendido + bump storage key
    status: completed
  - id: ui-components
    content: "Adicionar componentes UI Shadcn faltantes: Slider, Select, RadioGroup (+ deps Radix)"
    status: completed
  - id: contexts
    content: Estender SettingsContext (personalidade/instruções/canais) e criar KnowledgeBaseContext (upload mock uploading->processing->ready|error); registrar provider
    status: completed
  - id: agent-ui
    content: Reescrever AgentPage com Tabs (Visão Geral, Personalidade, Base de Conhecimento, Instruções, Canais) e componentes agent/ (personality-form, system-instructions, knowledge-base-section, file-upload/list/item, channel-config-card, evolução dos cards WhatsApp/Uso Pessoal)
    status: completed
  - id: dashboard-ui
    content: "Evoluir Dashboard: status do agente, arquivos enviados, últimas conversas, saúde da base, configurações pendentes"
    status: completed
  - id: produto
    content: "Atualizar PRODUTO.md: Meu Agente como centro de config, Personalidade, Base de Conhecimento, config por canal, novas jornadas/regras, Dashboard, roadmap RAG e glossário"
    status: completed
  - id: planejamento
    content: "Atualizar PLANEJAMENTO.md: sitemap/sub-rotas, novos fluxos (mermaid), wireframes conceituais, novos componentes/estados, Slider/Select/RadioGroup, estados mockados e critérios de aceite"
    status: completed
  - id: arquitetura
    content: "Atualizar ARQUITETURA.md: modelo de dados estendido, novos contexts (KnowledgeBase) e funções de Settings, rotas, types, mockado vs real, caminho para RAG/IA e nota de compatibilidade"
    status: completed
isProject: false
---

# Proposta v2 — documentos + implementação no sistema

Atualizar os três documentos em `documentation/` **e implementar** as mudanças no código (`src/`). O sistema permanece 100% mockado (sem IA/RAG/WhatsApp reais); a arquitetura é preparada para essas integrações futuras.

## Decisões norteadoras (confirmadas)

- Modelo de "dois agentes" = dois **canais** (Uso Pessoal e WhatsApp). Cada canal pode **herdar ou sobrescrever** uma personalidade e uma base de conhecimento **compartilhadas**, além de ter **instruções próprias**.
- Nomenclatura **amigável + modo avançado**: ex. "Instruções do Sistema" -> "Instruções do Assistente"; controles técnicos (temperatura, etc.) com rótulos amigáveis e tooltips; termos crus só num "modo avançado".
- Tudo mockado: upload sem processamento real, estados visuais (enviando/processando/pronto/erro), listas mock.

## Modelo de dados proposto (base da Arquitetura)

```typescript
// Personalidade (reutilizável: base ou por canal)
interface AgentPersonality {
  temperature: number;       // 0-100 (rótulo: "Previsível <-> Criativo")
  creativity: number;        // 0-100
  formality: number;         // 0-100 ("Casual <-> Formal")
  objectivity: number;       // 0-100 ("Detalhado <-> Direto")
  technicalLevel: number;    // 0-100 ("Simples <-> Técnico")
  toneOfVoice: "amigavel" | "profissional" | "empatico" | "casual" | "neutro";
  writingStyle: "conciso" | "equilibrado" | "detalhado" | "narrativo";
  emojiUsage: "nunca" | "as_vezes" | "frequente";
  responseLength: "curta" | "media" | "longa";
}

// Base de Conhecimento (futuro RAG) — apenas estados visuais por enquanto
type KnowledgeFileType = "pdf" | "docx" | "txt" | "csv" | "xlsx" | "image" | "other";
type KnowledgeFileStatus = "uploading" | "processing" | "ready" | "error";
interface KnowledgeFile {
  id: string;
  name: string;
  type: KnowledgeFileType;
  sizeBytes: number;
  status: KnowledgeFileStatus;
  progress?: number;          // % de upload/processamento (mock)
  errorMessage?: string;
  uploadedAt: string;
  // Placeholders p/ RAG futuro (não usados na UI ainda):
  chunks?: number; vectors?: number; indexedAt?: string;
}
interface KnowledgeBase { files: KnowledgeFile[]; }

// Configuração por canal (Uso Pessoal e WhatsApp = "dois agentes")
// ABORDAGEM RETROCOMPATÍVEL: mantém as chaves atuais `whatsapp` e `personalUse`
// (com enabled/connectionStatus) e ADICIONA os campos novos por cima.
type ChannelId = "personalUse" | "whatsapp";
interface ChannelConfigBase {
  enabled: boolean;
  useSharedPersonality: boolean;   // herda a personalidade base?
  useSharedKnowledgeBase: boolean; // herda a base de conhecimento?
  personality?: AgentPersonality;  // usado só quando useSharedPersonality === false
  instructions: string;            // instruções específicas do canal
}
interface WhatsAppChannelConfig extends ChannelConfigBase {
  phoneNumber?: string;
  connectionStatus: ConnectionStatus; // mantém o que já existe hoje
  connectedAt?: string;
}
type PersonalUseChannelConfig = ChannelConfigBase;

type AgentStatus = "draft" | "active" | "paused";
// AgentSettings ESTENDIDO (preserva settings.whatsapp / settings.personalUse atuais)
interface AgentSettings {
  agent: { name: string; avatarUrl?: string; status: AgentStatus; description?: string };
  basePersonality: AgentPersonality;   // personalidade compartilhada
  baseInstructions: string;            // "Instruções do Assistente" globais
  knowledgeBase: KnowledgeBase;        // base compartilhada
  whatsapp: WhatsAppChannelConfig;     // mantém enabled/connectionStatus existentes
  personalUse: PersonalUseChannelConfig; // mantém enabled existente
}
```

> **Compatibilidade:** como o shape muda, a chave de `localStorage` de settings sobe para `flowassist_settings_v2` (em `STORAGE_KEYS`), evitando que dados antigos quebrem a UI. Consumidores atuais (`nav-items` lê `personalUse.enabled`, guard do Chat, `quick-stats`, cards de canal) continuam lendo `settings.whatsapp.*` e `settings.personalUse.*` sem alteração.

## Implementação no código (`src/`)

Ordem sugerida (do dado para a UI):

1. **Types** — [src/types/index.ts](src/types/index.ts): adicionar `AgentPersonality`, `KnowledgeFileType`, `KnowledgeFileStatus`, `KnowledgeFile`, `KnowledgeBase`, `ChannelConfigBase`, `WhatsAppChannelConfig`, `PersonalUseChannelConfig`, `AgentStatus`, `ChannelId`; estender `AgentSettings`; estender `ActivityType` com `"knowledge" | "personality"`.
2. **Mocks** — novo [src/mocks/personality.ts](src/mocks/personality.ts) (`DEFAULT_PERSONALITY`, `PERSONALITY_PRESETS`), novo [src/mocks/knowledge-base.ts](src/mocks/knowledge-base.ts) (`MOCK_KNOWLEDGE_FILES` cobrindo os 4 estados), e [src/mocks/agent-settings.ts](src/mocks/agent-settings.ts) estendido (`DEMO_SETTINGS`/`INITIAL_SETTINGS` com `agent`, `basePersonality`, `baseInstructions`, `knowledgeBase`, e canais com herança/instruções).
3. **Constantes** — [src/lib/constants.ts](src/lib/constants.ts): bump `STORAGE_KEYS.settings` para v2 + nova chave `knowledge`; adicionar sub-rotas em `ROUTES` (`agentPersonality`, `agentKnowledge`, `agentInstructions`, `agentChannelPersonal`, `agentChannelWhatsapp`).
4. **UI Shadcn faltantes** — `src/components/ui/slider.tsx`, `select.tsx`, `radio-group.tsx` (instalar `@radix-ui/react-slider`, `@radix-ui/react-select`, `@radix-ui/react-radio-group`).
5. **Contexts** — estender [src/contexts/settings-context.tsx](src/contexts/settings-context.tsx) (`updateAgentProfile`, `updateBasePersonality`, `updateBaseInstructions`, `updateChannelConfig(channelId, patch)`, `setChannelPersonality`, helpers de herança). Novo [src/contexts/knowledge-base-context.tsx](src/contexts/knowledge-base-context.tsx) com `files`, `addFiles(fileList)`, `removeFile(id)`, `retryFile(id)` simulando `uploading -> processing -> ready|error` via `setTimeout` (persistência opcional). Registrar em [src/app/providers.tsx](src/app/providers.tsx).
6. **Meu Agente (UI)** — reescrever [src/pages/AgentPage.tsx](src/pages/AgentPage.tsx) com `Tabs`: Visão Geral, Personalidade, Base de Conhecimento, Instruções, Canais. Novos componentes em `src/components/agent/`:
  - `agent-overview.tsx` / `agent-status-card.tsx` (nome, status, resumo da config)
  - `personality-form.tsx` + `personality-slider.tsx` + `personality-presets.tsx` (sliders 0-100, selects de tom/estilo/emojis/tamanho, modo avançado com termos técnicos)
  - `system-instructions-editor.tsx` (textarea longa com dicas)
  - `knowledge-base-section.tsx`, `knowledge-file-upload.tsx` (dropzone mock), `knowledge-file-list.tsx`, `knowledge-file-item.tsx` (ícone por tipo, badge de status, barra de progresso, ação de retry/remover)
  - `channel-config-card.tsx` (genérico, com toggles de herança e instruções por canal); evoluir [src/components/agent/whatsapp-config-card.tsx](src/components/agent/whatsapp-config-card.tsx) e [src/components/agent/personal-use-config-card.tsx](src/components/agent/personal-use-config-card.tsx) para usá-lo.
7. **Dashboard (UI)** — em `src/components/dashboard/`: `agent-status-card.tsx`, `knowledge-health-card.tsx`, `recent-conversations-card.tsx`, `pending-setup-card.tsx`; atualizar [src/components/dashboard/quick-stats.tsx](src/components/dashboard/quick-stats.tsx) e [src/pages/DashboardPage.tsx](src/pages/DashboardPage.tsx). "Configurações pendentes" derivadas de regras simples (sem instruções, sem arquivo pronto, canal ligado sem personalidade).
8. **Validação/lint** — checar lints dos arquivos editados e `npm run build` (type-check) ao final.

## Atualizações em PRODUTO.md

Arquivo: [documentation/PRODUTO.md](documentation/PRODUTO.md)

- **Seção 5 (Conceito central):** reposicionar "Meu Agente" como o **centro de configuração** do assistente (não só liga/desliga). Reforçar o conceito de "dois canais" (Uso Pessoal e WhatsApp) que compartilham ou personalizam comportamento.
- **Seção 6 (Visão geral das telas):** atualizar a linha "Meu Agente" e adicionar subseções: Personalidade, Base de Conhecimento, Canais.
- **Seção 7 (Jornada):** novas jornadas — "Personalizar o comportamento do assistente", "Enviar materiais para o assistente aprender (Base de Conhecimento)", "Configurar cada canal de forma independente".
- **Nova seção 8.3 expandida (Meu Agente):** descrever em linguagem de produto: Personalidade (deslizadores de comportamento, tom de voz, emojis, tamanho de resposta), Instruções do Assistente (campo longo: como responder, como não responder, regras de negócio, contexto da empresa), Base de Conhecimento (upload de PDF/DOCX/TXT/CSV/XLSX/imagens, estados de envio/processamento/pronto/erro) e Configuração por Canal.
- **Seção 8.2 (Dashboard):** novos blocos — status do agente, arquivos enviados, últimas conversas, saúde da base de conhecimento, configurações pendentes.
- **Novas regras de negócio:** herança de personalidade/base por canal; um canal só "responde bem" quando tem personalidade + instruções definidas; base de conhecimento é compartilhada por padrão mas pode ser desativada por canal.
- **Seção 11 (Estado atual):** declarar explicitamente que Personalidade, Base de Conhecimento e config por canal são **mockados** (sem IA/RAG/vetorização reais).
- **Seção 12 (Roadmap):** reescrever a Fase 4 (IA real) para citar que a UI de Base de Conhecimento e Personalidade já prepara RAG, vetorização, busca semântica e contexto personalizado.
- **Seção 14 (Glossário):** novos termos — Personalidade, Base de Conhecimento, Instruções do Assistente, Canal, Herança de configuração.

## Atualizações em PLANEJAMENTO.md

Arquivo: [documentation/PLANEJAMENTO.md](documentation/PLANEJAMENTO.md)

- **Sitemap (seção 2):** expandir `/app/meu-agente` com sub-seções (via Tabs, opcionalmente roteadas): Visão Geral, Personalidade, Base de Conhecimento, Instruções, Canais (Uso Pessoal / WhatsApp). Atualizar breadcrumbs.
- **Fluxos (seção 3):** adicionar diagramas mermaid para: (a) configurar Personalidade, (b) upload na Base de Conhecimento com máquina de estados `uploading -> processing -> ready | error`, (c) configurar canal com herança (herda base OU personaliza).
- **UX/UI (seção 4):** wireframes conceituais (em texto) das novas telas: layout de Personalidade (deslizadores + selects + preview de tom), card de upload (dropzone mock + lista de arquivos com badges de status), cards de canal com toggle de herança. Adicionar novos estados de interface (upload/processamento/erro de arquivo; "configuração pendente").
- **Design System (seção 5):** novos componentes Shadcn a instalar — **Slider** (deslizadores de personalidade), **Select** e/ou **RadioGroup** (tom, estilo, emojis, tamanho). Novos ícones Lucide (`Upload`, `FileText`, `Brain`/`BookOpen`, `SlidersHorizontal`, `Sparkles`, `AlertCircle`, `Loader2`). Tokens de status de arquivo.
- **Estrutura de componentes (seção 6):** nova subseção "Componentes de Meu Agente (v2)" — `AgentOverview`/`AgentStatusCard`, `PersonalityForm`, `PersonalityPresets`, `PersonalitySlider`, `SystemInstructionsEditor`, `KnowledgeBaseSection`, `KnowledgeFileUpload` (dropzone mock), `KnowledgeFileList`, `KnowledgeFileItem` (badge de status + progresso), `ChannelConfigCard` (genérico, com herança), evolução de `WhatsAppConfigCard`/`PersonalUseConfigCard`. Novos componentes de Dashboard: `AgentStatusCard`, `KnowledgeHealthCard`, `RecentConversationsCard`, `PendingSetupCard`.
- **Estados mockados (seção 8):** novos blocos de dados — `DEFAULT_PERSONALITY` e presets; `MOCK_KNOWLEDGE_FILES` cobrindo os 4 estados; `DEMO_SETTINGS` estendido com `channels`, `basePersonality`, `baseInstructions`, `knowledgeBase`.
- **Critérios de aceite:** acrescentar itens para Personalidade salva/persistida, upload mock com transições de estado, herança por canal refletida na UI, Dashboard com os 5 novos blocos.

## Atualizações em ARQUITETURA.md

Arquivo: [documentation/ARQUITETURA.md](documentation/ARQUITETURA.md)

- **Seção 4 (estrutura de pastas):** novos mocks (`mocks/personality.ts`, `mocks/knowledge-base.ts`), `agent-settings.ts` estendido; novos componentes em `components/agent/` e `components/dashboard/`; novos componentes UI (`ui/slider.tsx`, `ui/select.tsx`, `ui/radio-group.tsx`).
- **Seção 6 (roteamento):** novas sub-rotas opcionais sob `/app/meu-agente` (personalidade, base-de-conhecimento, instrucoes, canais/uso-pessoal, canais/whatsapp) e correspondência em `ROUTES`.
- **Seção 8 (estado/Contexts):** estender `SettingsContext` com `updateBasePersonality`, `updateBaseInstructions`, `updateChannelConfig(channelId, patch)`, `setChannelInheritance`; **novo `KnowledgeBaseContext`** com `addFiles`, `removeFile`, `retryFile` e a simulação de upload (`uploading -> processing -> ready|error` via `setTimeout`). Diagrama mermaid da máquina de estados do arquivo.
- **Seção 9 (mockado vs real):** adicionar linhas para Personalidade, Base de Conhecimento e config por canal, indicando onde está o mock e o que será IA/RAG real depois.
- **Seção 10 (types):** documentar as novas interfaces (`AgentPersonality`, `KnowledgeFile`, `KnowledgeBase`, `ChannelConfig`, `AgentStatus`, `AgentSettings` estendido) em `src/types/index.ts`.
- **Seção 11 (design system):** registrar tokens/cores de status de arquivo e os novos componentes UI.
- **Seção 17 (caminho para produção):** detalhar como a Base de Conhecimento vira RAG real (storage de arquivos -> extração -> chunking -> embeddings/vetores -> busca semântica) e como `basePersonality`/`channels` viram parâmetros do prompt/modelo, mantendo a UI intacta (só troca a implementação dos contexts).
- **Nota de compatibilidade:** explicar a migração de `settings.whatsapp`/`settings.personalUse` (formato atual) para `settings.channels.{whatsapp,personalUse}` + config base, preservando a leitura existente do toggle e do `connectionStatus`.

## Itens de design a destacar nos docs

- Herança: cada canal tem toggles "Usar a personalidade base" e "Usar a base de conhecimento" — quando desligados, revelam config própria.
- "Configurações pendentes" no Dashboard derivam de regras simples (sem instruções, sem arquivos prontos, canal ligado sem personalidade definida).
- Preparação para IA: campos placeholder em `KnowledgeFile` (`chunks`, `vectors`, `indexedAt`) e a separação base/canal deixam o caminho pronto para RAG e prompt por canal.

