import type { Conversation, Message } from "@prisma/client";

/** Espelha o tipo `Conversation` do frontend (chat interno). */
export interface ConversationDTO {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

/** Espelha o tipo `Message` do frontend. */
export interface MessageDTO {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
}

export function toConversationDTO(c: Conversation): ConversationDTO {
  return {
    id: c.id,
    title: c.title,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt.toISOString(),
    messageCount: c.messageCount,
  };
}

export function toMessageDTO(m: Message): MessageDTO {
  return {
    id: m.id,
    conversationId: m.conversationId,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  };
}
