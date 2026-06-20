import { prisma } from "../../infra/prisma.js";
import { NotFound } from "../../infra/http/errors.js";
import { generateReply, type LlmMessage } from "../../infra/integrations/llm.client.js";
import { logActivity } from "../activities/activity.service.js";
import { loadAgent, getAgentId } from "../agents/agent.service.js";
import { searchByAgent } from "../knowledge/knowledge.service.js";
import { buildSystemPrompt, resolvePersonality } from "./chat.prompt.js";
import {
  toConversationDTO,
  toMessageDTO,
  type ConversationDTO,
  type MessageDTO,
} from "./chat.mapper.js";
import type { InternalConversationInput } from "./chat.dto.js";

const HISTORY_LIMIT = 12;

function summarize(content: string): string {
  return content.length > 48 ? `${content.slice(0, 45)}...` : content;
}

export async function listConversations(
  userId: string
): Promise<ConversationDTO[]> {
  const agentId = await getAgentId(userId);
  const conversations = await prisma.conversation.findMany({
    where: { agentId, channel: "personalUse" },
    orderBy: { lastMessageAt: "desc" },
  });
  return conversations.map(toConversationDTO);
}

export async function createConversation(
  userId: string
): Promise<ConversationDTO> {
  const agentId = await getAgentId(userId);
  const conversation = await prisma.conversation.create({
    data: { agentId, channel: "personalUse", title: "Nova conversa" },
  });
  await bumpConversationsUsage(userId);
  return toConversationDTO(conversation);
}

async function findOwnedConversation(userId: string, conversationId: string) {
  const agentId = await getAgentId(userId);
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, agentId },
  });
  if (!conversation) throw NotFound("Conversa nao encontrada");
  return conversation;
}

export async function getConversation(
  userId: string,
  conversationId: string
): Promise<{ conversation: ConversationDTO; messages: MessageDTO[] }> {
  const conversation = await findOwnedConversation(userId, conversationId);
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
  return {
    conversation: toConversationDTO(conversation),
    messages: messages.map(toMessageDTO),
  };
}

export async function getMessages(
  userId: string,
  conversationId: string
): Promise<MessageDTO[]> {
  await findOwnedConversation(userId, conversationId);
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
  return messages.map(toMessageDTO);
}

export async function deleteConversation(
  userId: string,
  conversationId: string
): Promise<void> {
  const conversation = await findOwnedConversation(userId, conversationId);
  await prisma.conversation.delete({ where: { id: conversation.id } });
}

/**
 * Envia uma mensagem do usuario e devolve a resposta do assistente.
 *
 * Orquestracao: salva a msg do usuario -> recupera contexto (RAG) -> monta o
 * prompt -> gera a resposta (mock ou via N8N/LLM) -> salva a resposta.
 */
export async function sendMessage(
  userId: string,
  conversationId: string,
  content: string
): Promise<{ userMessage: MessageDTO; assistantMessage: MessageDTO }> {
  const conversation = await findOwnedConversation(userId, conversationId);
  const trimmed = content.trim();

  const userMessage = await prisma.message.create({
    data: { conversationId, role: "user", content: trimmed },
  });

  const isFirst = conversation.messageCount === 0;
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      title: isFirst ? summarize(trimmed) : conversation.title,
      lastMessage: summarize(trimmed),
      lastMessageAt: new Date(),
      messageCount: { increment: 1 },
    },
  });
  await bumpChatUsage(userId);

  // Monta contexto e gera a resposta.
  const agent = await loadAgent(userId);
  const personalChannel = agent.channels.find((c) => c.channelId === "personalUse");
  const personality = resolvePersonality(agent, "personalUse");

  let knowledgeContext = "";
  if (personalChannel?.useSharedKnowledgeBase) {
    const hits = await searchByAgent(agent.id, trimmed, 5);
    knowledgeContext = hits.map((h) => h.content).join("\n---\n");
  }

  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
  });
  const llmHistory: LlmMessage[] = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const systemPrompt = buildSystemPrompt({
    agent,
    channelId: "personalUse",
    personality,
    knowledgeContext,
  });

  const replyText = await generateReply({
    systemPrompt,
    history: llmHistory,
    userMessage: trimmed,
    personality,
    knowledgeContext,
  });

  const assistantMessage = await prisma.message.create({
    data: { conversationId, role: "assistant", content: replyText },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: summarize(replyText),
      lastMessageAt: new Date(),
      messageCount: { increment: 1 },
    },
  });

  return {
    userMessage: toMessageDTO(userMessage),
    assistantMessage: toMessageDTO(assistantMessage),
  };
}

/**
 * Callback do N8N (WhatsApp): salva/atualiza o historico de uma conversa
 * iniciada pelo cliente final. Localiza por externalId, ou cria uma nova.
 */
export async function saveInternalConversation(
  input: InternalConversationInput
): Promise<ConversationDTO> {
  const agent = await prisma.agent.findUnique({ where: { id: input.agentId } });
  if (!agent) throw NotFound("Agente nao encontrado");

  let conversation = input.externalId
    ? await prisma.conversation.findFirst({
        where: { agentId: input.agentId, externalId: input.externalId },
      })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        agentId: input.agentId,
        channel: input.channel,
        externalId: input.externalId,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        title: input.title ?? input.contactName ?? "Conversa WhatsApp",
      },
    });
  }

  await prisma.message.createMany({
    data: input.messages.map((m) => ({
      conversationId: conversation!.id,
      role: m.role,
      content: m.content,
    })),
  });

  const last = input.messages[input.messages.length - 1];
  const updated = await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessage: summarize(last.content),
      lastMessageAt: new Date(),
      messageCount: { increment: input.messages.length },
    },
  });

  return toConversationDTO(updated);
}

async function bumpChatUsage(userId: string) {
  await prisma.subscription
    .update({
      where: { userId },
      data: { chatMsgsUsed: { increment: 1 } },
    })
    .catch(() => undefined);
}

async function bumpConversationsUsage(userId: string) {
  await prisma.subscription
    .update({
      where: { userId },
      data: { conversationsUsed: { increment: 1 } },
    })
    .catch(() => undefined);
  await logActivity(userId, "chat", "Nova conversa iniciada no chat");
}
