/**
 * Personalidade do agente. Espelha exatamente `AgentPersonality` do frontend
 * (frontend/src/types/index.ts). Campos numericos vao de 0 a 100.
 */
export interface AgentPersonality {
  temperature: number;
  creativity: number;
  formality: number;
  objectivity: number;
  technicalLevel: number;
  writingStyle: "conciso" | "equilibrado" | "detalhado" | "narrativo";
  emojiUsage: "nunca" | "as_vezes" | "frequente";
  responseLength: "curta" | "media" | "longa";
}

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
