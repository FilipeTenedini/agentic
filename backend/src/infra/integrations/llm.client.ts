import { env } from "../../config/env.js";
import { callN8nWebhook } from "./n8n.client.js";
import type { AgentPersonality } from "../../shared/domain/personality.js";

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateReplyParams {
  /** Prompt do sistema ja montado (instrucoes + personalidade + contexto RAG). */
  systemPrompt: string;
  history: LlmMessage[];
  userMessage: string;
  personality: AgentPersonality;
  /** Contexto recuperado da base de conhecimento (RAG). */
  knowledgeContext?: string;
}

const MOCK_REPLIES = [
  "Entendi! Posso ajudar com isso. Deixe-me elaborar uma sugestão para você.",
  "Ótima pergunta! Aqui está o que eu sugiro como próximo passo.",
  "Claro! Baseado no que você descreveu, eu seguiria por este caminho.",
  "Vou preparar isso para você. Aqui vai um primeiro rascunho.",
];

/**
 * Gera a resposta do assistente.
 *
 * - MOCK_AI=true  -> retorna uma resposta pre-escrita (sem custo, sem rede).
 * - MOCK_AI=false -> delega ao workflow "personal-use-chat" do N8N, que chama
 *   o LLM real (ver documentation/BACKEND-INTEGRACAO.md, Workflow 05).
 */
export async function generateReply(
  params: GenerateReplyParams
): Promise<string> {
  if (env.MOCK_AI) {
    const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
    await new Promise((resolve) => setTimeout(resolve, 600));
    return reply;
  }

  const result = await callN8nWebhook<{ reply?: string }>({
    path: "personal-use-chat",
    payload: {
      systemPrompt: params.systemPrompt,
      history: params.history,
      userMessage: params.userMessage,
      personality: params.personality,
      knowledgeContext: params.knowledgeContext ?? "",
    },
  });

  if (!result.reply?.trim()) {
    throw new Error("N8N respondeu sem o campo reply");
  }

  return result.reply;
}
