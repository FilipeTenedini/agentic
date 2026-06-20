import type { AgentPersonality } from "../../shared/domain/personality.js";
import type { AgentWithRelations } from "../agents/agent.mapper.js";

/** Resolve a personalidade efetiva de um canal (heranca da base ou propria). */
export function resolvePersonality(
  agent: AgentWithRelations,
  channelId: "whatsapp" | "personalUse"
): AgentPersonality {
  const channel = agent.channels.find((c) => c.channelId === channelId);
  if (channel && !channel.useSharedPersonality && channel.personality) {
    return channel.personality as unknown as AgentPersonality;
  }
  return agent.basePersonality as unknown as AgentPersonality;
}

/**
 * Monta o prompt do sistema combinando instrucoes base + instrucoes do canal +
 * a personalidade (traduzida em diretrizes de estilo) + contexto da base de
 * conhecimento (RAG). Este texto e o que o LLM recebe como system message.
 */
export function buildSystemPrompt(params: {
  agent: AgentWithRelations;
  channelId: "whatsapp" | "personalUse";
  personality: AgentPersonality;
  knowledgeContext?: string;
}): string {
  const { agent, channelId, personality, knowledgeContext } = params;
  const channel = agent.channels.find((c) => c.channelId === channelId);

  const parts: string[] = [];

  if (agent.baseInstructions.trim()) {
    parts.push(agent.baseInstructions.trim());
  }
  if (channel?.instructions.trim()) {
    parts.push(`Instrucoes especificas deste canal:\n${channel.instructions.trim()}`);
  }

  parts.push(personalityToGuidelines(personality));

  if (knowledgeContext && knowledgeContext.trim()) {
    parts.push(
      `Use as informacoes da base de conhecimento abaixo quando relevante:\n${knowledgeContext.trim()}`
    );
  }

  return parts.join("\n\n");
}

function personalityToGuidelines(p: AgentPersonality): string {
  const lines: string[] = ["Diretrizes de estilo:"];
  lines.push(`- Formalidade: ${describeScale(p.formality, "casual", "formal")}.`);
  lines.push(
    `- Objetividade: ${describeScale(p.objectivity, "detalhado", "direto")}.`
  );
  lines.push(
    `- Nivel tecnico: ${describeScale(p.technicalLevel, "simples", "tecnico")}.`
  );
  lines.push(`- Estilo de escrita: ${p.writingStyle}.`);
  lines.push(`- Uso de emojis: ${p.emojiUsage.replace("_", " ")}.`);
  lines.push(`- Tamanho das respostas: ${p.responseLength}.`);
  return lines.join("\n");
}

function describeScale(value: number, low: string, high: string): string {
  if (value <= 33) return low;
  if (value >= 66) return high;
  return `equilibrado entre ${low} e ${high}`;
}
