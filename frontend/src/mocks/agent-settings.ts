import type { AgentSettings } from "@/types";
import { DEFAULT_PERSONALITY } from "@/mocks/personality";
import { MOCK_KNOWLEDGE_FILES } from "@/mocks/knowledge-base";

export const MOCK_PHONE_NUMBER = "+55 11 98765-4321";

const DEMO_BASE_INSTRUCTIONS = `Você é o assistente da empresa. Responda sempre em português do Brasil, de forma cordial e objetiva.

Como responder:
- Cumprimente o cliente e seja prestativo.
- Use as informações da base de conhecimento quando disponíveis.
- Quando não souber, ofereça encaminhar para um atendente humano.

Como NÃO responder:
- Não invente preços, prazos ou políticas.
- Não compartilhe dados internos ou confidenciais.

Contexto da empresa:
- Atendimento de segunda a sexta, das 9h às 18h.`;

export const DEMO_SETTINGS: AgentSettings = {
  agent: {
    name: "Assistente FlowAssist",
    status: "active",
    description: "Atende clientes no WhatsApp e ajuda no dia a dia pelo chat interno.",
  },
  basePersonality: { ...DEFAULT_PERSONALITY },
  baseInstructions: DEMO_BASE_INSTRUCTIONS,
  knowledgeBase: {
    files: MOCK_KNOWLEDGE_FILES,
  },
  whatsapp: {
    enabled: true,
    phoneNumber: MOCK_PHONE_NUMBER,
    connectionStatus: "connected",
    connectedAt: "2025-06-18T10:00:00Z",
    useSharedPersonality: false,
    useSharedKnowledgeBase: true,
    instructions:
      "Seja breve e objetivo. Responda em no máximo 3 frases.\n\nSempre finalize com uma pergunta para engajar o cliente.\n\nEvite listas longas ou formatação Markdown.",
    personality: {
      temperature: 45,
      creativity: 40,
      formality: 50,
      objectivity: 75,
      technicalLevel: 25,
      writingStyle: "conciso",
      emojiUsage: "as_vezes",
      responseLength: "curta",
    },
  },
  personalUse: {
    enabled: true,
    useSharedPersonality: false,
    useSharedKnowledgeBase: true,
    instructions:
      "Pode usar linguagem mais técnica e detalhada.\n\nUse listas e marcadores para organizar respostas complexas.\n\nCite fontes da base de conhecimento quando disponíveis.",
    personality: {
      temperature: 55,
      creativity: 60,
      formality: 65,
      objectivity: 60,
      technicalLevel: 70,
      writingStyle: "detalhado",
      emojiUsage: "nunca",
      responseLength: "longa",
    },
  },
};

export const INITIAL_SETTINGS: AgentSettings = {
  agent: {
    name: "Meu Assistente",
    status: "draft",
    description: "",
  },
  basePersonality: { ...DEFAULT_PERSONALITY },
  baseInstructions: "",
  knowledgeBase: {
    files: [],
  },
  whatsapp: {
    enabled: false,
    connectionStatus: "disconnected",
    useSharedPersonality: false,
    useSharedKnowledgeBase: true,
    instructions: "",
    personality: { ...DEFAULT_PERSONALITY },
  },
  personalUse: {
    enabled: false,
    useSharedPersonality: false,
    useSharedKnowledgeBase: true,
    instructions: "",
    personality: { ...DEFAULT_PERSONALITY },
  },
};
