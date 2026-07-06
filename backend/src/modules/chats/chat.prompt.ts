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
  /** Quando true, o canal usa a base compartilhada (RAG tentado nesta mensagem). */
  knowledgeBaseEnabled?: boolean;
  /** Primeira mensagem da conversa (permite cumprimento inicial). */
  isFirstMessage?: boolean;
}): string {
  const {
    agent,
    channelId,
    personality,
    knowledgeContext,
    knowledgeBaseEnabled,
    isFirstMessage = false,
  } = params;
  const channel = agent.channels.find((c) => c.channelId === channelId);

  const parts: string[] = [];

  if (agent.baseInstructions.trim()) {
    parts.push(agent.baseInstructions.trim());
  }
  if (channel?.instructions.trim()) {
    parts.push(`Instrucoes especificas deste canal:\n${channel.instructions.trim()}`);
  }

  parts.push(conversationGuidelines(isFirstMessage));
  parts.push(personalityToGuidelines(personality));
  parts.push(knowledgeGuidelines(knowledgeContext, knowledgeBaseEnabled));

  return parts.join("\n\n");
}

function conversationGuidelines(isFirstMessage: boolean): string {
  const lines = [
    "Continuidade da conversa:",
    "- Mantenha o fio do assunto usando o historico enviado.",
    "- Follow-ups ('mais informacoes', 'explique melhor', 'e isso?') referem-se ao topico ja em discussao — nao peca ao usuario para repetir o contexto.",
    "- Responda como um assistente em chat continuo, nao como um bot que reinicia a cada mensagem.",
  ];

  if (isFirstMessage) {
    lines.push("- Esta e a primeira mensagem da conversa: cumprimente brevemente se fizer sentido.");
  } else {
    lines.push(
      "- NAO repita cumprimentos (Olá, Oi, Hey) — va direto ao ponto.",
      "- NAO reintroduza o assunto como se fosse a primeira interacao."
    );
  }

  return lines.join("\n");
}

function knowledgeGuidelines(
  knowledgeContext?: string,
  knowledgeBaseEnabled?: boolean
): string {
  if (knowledgeContext?.trim()) {
    return [
      "Base de conhecimento (trechos recuperados — use quando forem relevantes):",
      knowledgeContext.trim(),
      "",
      "Como usar a base:",
      "- Priorize os trechos para fatos, numeros, nomes e dados especificos da empresa ou dos arquivos.",
      "- Complemente com explicacao natural e conhecimento geral quando ajudar o usuario a entender.",
      "- Nao invente numeros, politicas ou dados que deveriam vir dos arquivos.",
      "- Se faltar um dado especifico nos trechos, diga com honestidade em vez de inventar.",
      "- Integre as informacoes na resposta; evite citar 'linha X do arquivo' salvo se o usuario pedir referencia explicita.",
    ].join("\n");
  }

  if (knowledgeBaseEnabled) {
    return [
      "Base de conhecimento:",
      "Nenhum trecho relevante foi encontrado nos arquivos indexados para esta pergunta.",
      "Responda normalmente com seu conhecimento geral e o contexto da conversa.",
      "Nao invente numeros, politicas internas ou dados que deveriam vir dos arquivos da empresa.",
    ].join("\n");
  }

  return "";
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
