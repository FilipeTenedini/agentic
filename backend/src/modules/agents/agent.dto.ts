import { z } from "zod";

export const personalitySchema = z.object({
  temperature: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  formality: z.number().min(0).max(100),
  objectivity: z.number().min(0).max(100),
  technicalLevel: z.number().min(0).max(100),
  writingStyle: z.enum(["conciso", "equilibrado", "detalhado", "narrativo"]),
  emojiUsage: z.enum(["nunca", "as_vezes", "frequente"]),
  responseLength: z.enum(["curta", "media", "longa"]),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused"]).optional(),
  avatarUrl: z.string().optional(),
});

export const updateInstructionsSchema = z.object({
  instructions: z.string(),
});

export const channelIdSchema = z.object({
  channelId: z.enum(["whatsapp", "personalUse"]),
});

export const updateChannelSchema = z.object({
  enabled: z.boolean().optional(),
  useSharedPersonality: z.boolean().optional(),
  useSharedKnowledgeBase: z.boolean().optional(),
  personality: personalitySchema.optional(),
  instructions: z.string().optional(),
});

/** Callback do N8N para atualizar o status da conexao WhatsApp. */
export const whatsappStatusSchema = z.object({
  connectionStatus: z.enum([
    "disconnected",
    "connecting",
    "connected",
    "reconnecting",
  ]),
  phoneNumber: z.string().optional(),
  connectedAt: z.string().optional(),
  qrCode: z.string().optional(),
});

export type PersonalityInput = z.infer<typeof personalitySchema>;
export type UpdateAgentProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type WhatsAppStatusInput = z.infer<typeof whatsappStatusSchema>;
