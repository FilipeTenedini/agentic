export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

/**
 * Personalidade do agente. Reutilizável tanto como personalidade "base"
 * (compartilhada) quanto como personalidade específica de um canal.
 *
 * Os campos numéricos vão de 0 a 100 e, hoje, são puramente visuais/mockados.
 * No futuro, virarão parâmetros do modelo (ex.: temperature) e do prompt.
 */
export interface AgentPersonality {
  /** "Previsível" (0) <-> "Criativo" (100). Mapeia para temperature no futuro. */
  temperature: number;
  /** Quão original/inventivo o assistente é. */
  creativity: number;
  /** "Casual" (0) <-> "Formal" (100). */
  formality: number;
  /** "Detalhado" (0) <-> "Direto" (100). */
  objectivity: number;
  /** "Simples" (0) <-> "Técnico" (100). */
  technicalLevel: number;
  writingStyle: "conciso" | "equilibrado" | "detalhado" | "narrativo";
  emojiUsage: "nunca" | "as_vezes" | "frequente";
  responseLength: "curta" | "media" | "longa";
}

export type KnowledgeFileType = "csv" | "xlsx";

export type KnowledgeFileStatus = "uploading" | "processing" | "ready" | "error";

/**
 * Arquivo da Base de Conhecimento (futuro RAG).
 *
 * Hoje é 100% mockado: nenhum arquivo é realmente processado. Os campos
 * `chunks`, `vectors` e `indexedAt` são placeholders que preparam a futura
 * implementação de vetorização e busca semântica.
 */
export interface KnowledgeFile {
  id: string;
  name: string;
  type: KnowledgeFileType;
  sizeBytes: number;
  status: KnowledgeFileStatus;
  /** % de upload/processamento (0-100), usado durante uploading/processing. */
  progress?: number;
  errorMessage?: string;
  uploadedAt: string;
  // Placeholders para o futuro RAG (não usados na UI ainda):
  chunks?: number;
  vectors?: number;
  indexedAt?: string;
}

export interface KnowledgeBase {
  files: KnowledgeFile[];
}

export type ChannelId = "personalUse" | "whatsapp";

/**
 * Configuração comum a todos os canais. Cada canal pode herdar a personalidade
 * e a base de conhecimento "base" (compartilhadas) ou definir as suas próprias.
 */
export interface ChannelConfigBase {
  enabled: boolean;
  /** Quando true, usa `basePersonality`; quando false, usa `personality`. */
  useSharedPersonality: boolean;
  /** Quando true, usa a `knowledgeBase` compartilhada do agente. */
  useSharedKnowledgeBase: boolean;
  /** Personalidade própria do canal (usada só quando useSharedPersonality=false). */
  personality?: AgentPersonality;
  /** Instruções específicas deste canal (somadas às instruções base). */
  instructions: string;
}

export interface WhatsAppChannelConfig extends ChannelConfigBase {
  phoneNumber?: string;
  connectionStatus: ConnectionStatus;
  connectedAt?: string;
}

export type PersonalUseChannelConfig = ChannelConfigBase;

export type AgentStatus = "draft" | "active" | "paused";

export interface AgentProfile {
  name: string;
  avatarUrl?: string;
  status: AgentStatus;
  description?: string;
}

export interface AgentSettings {
  /** Identidade e status geral do agente. */
  agent: AgentProfile;
  /** Personalidade compartilhada (padrão herdado pelos canais). */
  basePersonality: AgentPersonality;
  /** Instruções do Assistente globais (regras de negócio, contexto da empresa). */
  baseInstructions: string;
  /** Base de conhecimento compartilhada (futuro RAG). */
  knowledgeBase: KnowledgeBase;
  whatsapp: WhatsAppChannelConfig;
  personalUse: PersonalUseChannelConfig;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export type PlanId = "free" | "starter" | "pro" | "business";

export interface UsageLimit {
  used: number;
  max: number;
}

export interface Subscription {
  plan: PlanId;
  planName: string;
  price: number;
  currency: "BRL";
  renewalDate: string;
  status: "active" | "past_due" | "canceled";
  limits: {
    whatsappMessages: UsageLimit;
    chatMessages: UsageLimit;
    conversations: UsageLimit;
  };
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export type ActivityType =
  | "whatsapp"
  | "chat"
  | "config"
  | "knowledge"
  | "personality";

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
