import type { LlmMessage } from "../../infra/integrations/llm.client.js";

/** Mensagens curtas ou vagas costumam ser follow-up do turno anterior. */
const SHORT_UTTERANCE_MAX_CHARS = 12;

const FOLLOW_UP_START =
  /^(quero|preciso|pode|me (fale|diga|explica)|mais (info|detalhe|inform)|continua|detalha|explique|e (sobre|isso)|sobre isso|isso|aquilo|por que|como assim)/i;

const GREETING_OR_ACK =
  /^(oi|ola|olá|hey|e ai|e aí|ok|certo|sim|nao|não|obrigad|valeu)$/i;

/**
 * Monta a query usada no embed + busca RAG, considerando o historico da conversa.
 * Follow-ups como "quero mais informacoes" passam a incluir o assunto em andamento.
 */
export function buildRagSearchQuery(
  userMessage: string,
  history: LlmMessage[]
): string {
  const trimmed = userMessage.trim();
  if (!trimmed) return trimmed;

  const prior = history.filter(
    (m) => !(m.role === "user" && m.content.trim() === trimmed)
  );

  if (!needsConversationContext(trimmed, prior)) {
    return trimmed;
  }

  const topic = extractRecentTopic(prior);
  if (!topic) return trimmed;

  return `${topic}. ${trimmed}`;
}

function needsConversationContext(
  userMessage: string,
  priorHistory: LlmMessage[]
): boolean {
  if (priorHistory.length === 0) return false;

  const trimmed = userMessage.trim();
  const len = trimmed.length;

  if (len <= SHORT_UTTERANCE_MAX_CHARS) return true;
  if (GREETING_OR_ACK.test(trimmed)) return true;
  if (FOLLOW_UP_START.test(trimmed)) return true;

  return false;
}

/** Ultimas mensagens user/assistant que definem o topico em discussao. */
function extractRecentTopic(priorHistory: LlmMessage[]): string {
  const recent = priorHistory.slice(-8);
  const lastUser = [...recent].reverse().find((m) => m.role === "user");
  const lastAssistant = [...recent].reverse().find((m) => m.role === "assistant");

  const parts: string[] = [];

  if (lastUser?.content.trim()) {
    parts.push(lastUser.content.trim());
  }

  if (lastAssistant?.content.trim()) {
    const snippet = lastAssistant.content.trim().slice(0, 280);
    if (snippet && !parts.some((p) => snippet.startsWith(p.slice(0, 40)))) {
      parts.push(snippet);
    }
  }

  return parts.join(" — ").slice(0, 600);
}
