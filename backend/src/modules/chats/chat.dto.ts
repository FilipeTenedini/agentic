import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Mensagem vazia"),
});

/** Callback do N8N: salva o historico de uma conversa do WhatsApp. */
export const internalConversationSchema = z.object({
  agentId: z.string().min(1),
  channel: z.enum(["whatsapp", "personalUse"]).default("whatsapp"),
  externalId: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  title: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .min(1),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type InternalConversationInput = z.infer<typeof internalConversationSchema>;
