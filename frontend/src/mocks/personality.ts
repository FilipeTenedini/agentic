import type { AgentPersonality } from "@/types";

/**
 * Personalidade padrão do agente. Valores em 0-100 são mockados e, no futuro,
 * viram parâmetros do modelo/prompt (ver ARQUITETURA.md, seção 17).
 */
export const DEFAULT_PERSONALITY: AgentPersonality = {
  temperature: 50,
  creativity: 50,
  formality: 60,
  objectivity: 55,
  technicalLevel: 40,
  writingStyle: "equilibrado",
  emojiUsage: "as_vezes",
  responseLength: "media",
};

export interface PersonalityPreset {
  id: string;
  name: string;
  description: string;
  personality: AgentPersonality;
}

/**
 * Presets prontos para o usuário aplicar com um clique. São apenas atalhos
 * que preenchem os controles de personalidade.
 */
export const PERSONALITY_PRESETS: PersonalityPreset[] = [
  {
    id: "atendimento",
    name: "Atendimento",
    description: "Cordial, claro e prestativo para suporte ao cliente.",
    personality: {
      temperature: 40,
      creativity: 35,
      formality: 55,
      objectivity: 65,
      technicalLevel: 30,
      writingStyle: "conciso",
      emojiUsage: "as_vezes",
      responseLength: "media",
    },
  },
  {
    id: "vendas",
    name: "Vendas",
    description: "Persuasivo e entusiasmado para converter clientes.",
    personality: {
      temperature: 65,
      creativity: 70,
      formality: 40,
      objectivity: 50,
      technicalLevel: 25,
      writingStyle: "equilibrado",
      emojiUsage: "frequente",
      responseLength: "media",
    },
  },
  {
    id: "tecnico",
    name: "Suporte técnico",
    description: "Preciso, detalhista e objetivo para questões técnicas.",
    personality: {
      temperature: 25,
      creativity: 20,
      formality: 70,
      objectivity: 80,
      technicalLevel: 85,
      writingStyle: "detalhado",
      emojiUsage: "nunca",
      responseLength: "longa",
    },
  },
  {
    id: "formal",
    name: "Corporativo",
    description: "Formal e direto, ideal para comunicação empresarial.",
    personality: {
      temperature: 30,
      creativity: 30,
      formality: 90,
      objectivity: 75,
      technicalLevel: 50,
      writingStyle: "conciso",
      emojiUsage: "nunca",
      responseLength: "media",
    },
  },
];

export const WRITING_STYLE_OPTIONS: {
  value: AgentPersonality["writingStyle"];
  label: string;
}[] = [
  { value: "conciso", label: "Conciso" },
  { value: "equilibrado", label: "Equilibrado" },
  { value: "detalhado", label: "Detalhado" },
  { value: "narrativo", label: "Narrativo" },
];

export const EMOJI_OPTIONS: { value: AgentPersonality["emojiUsage"]; label: string }[] = [
  { value: "nunca", label: "Nunca" },
  { value: "as_vezes", label: "Às vezes" },
  { value: "frequente", label: "Frequente" },
];

export const RESPONSE_LENGTH_OPTIONS: {
  value: AgentPersonality["responseLength"];
  label: string;
}[] = [
  { value: "curta", label: "Curta" },
  { value: "media", label: "Média" },
  { value: "longa", label: "Longa" },
];

/**
 * Deslizadores de comportamento. `label` é o nome amigável e `advancedLabel`
 * o termo técnico exibido no "modo avançado".
 */
export const PERSONALITY_SLIDERS: {
  key: keyof Pick<
    AgentPersonality,
    "temperature" | "creativity" | "formality" | "objectivity" | "technicalLevel"
  >;
  label: string;
  advancedLabel: string;
  minLabel: string;
  maxLabel: string;
  hint: string;
}[] = [
  {
    key: "temperature",
    label: "Espontaneidade",
    advancedLabel: "Temperatura",
    minLabel: "Previsível",
    maxLabel: "Criativo",
    hint: "Controla o quanto as respostas variam. Mais alto = mais surpreendente.",
  },
  {
    key: "creativity",
    label: "Criatividade",
    advancedLabel: "Top-p / diversidade",
    minLabel: "Conservador",
    maxLabel: "Inventivo",
    hint: "Quão original o assistente é ao propor ideias.",
  },
  {
    key: "formality",
    label: "Formalidade",
    advancedLabel: "Formality bias",
    minLabel: "Casual",
    maxLabel: "Formal",
    hint: "Define o nível de formalidade da linguagem.",
  },
  {
    key: "objectivity",
    label: "Objetividade",
    advancedLabel: "Verbosity penalty",
    minLabel: "Detalhado",
    maxLabel: "Direto",
    hint: "Quanto mais alto, mais curtas e diretas as respostas.",
  },
  {
    key: "technicalLevel",
    label: "Nível técnico",
    advancedLabel: "Domain depth",
    minLabel: "Simples",
    maxLabel: "Técnico",
    hint: "Profundidade técnica do vocabulário e das explicações.",
  },
];
