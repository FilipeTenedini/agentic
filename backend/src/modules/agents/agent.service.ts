import { prisma } from "../../infra/prisma.js";
import { NotFound } from "../../infra/http/errors.js";
import { asJson } from "../../shared/utils/json.js";
import { logActivity } from "../activities/activity.service.js";
import {
  toAgentSettingsDTO,
  type AgentSettingsDTO,
  type AgentWithRelations,
} from "./agent.mapper.js";
import type {
  PersonalityInput,
  UpdateAgentProfileInput,
  UpdateChannelInput,
} from "./agent.dto.js";

const includeRelations = {
  channels: true,
  whatsappConnection: true,
} as const;

/** Carrega o agente do usuario com canais e conexao WhatsApp. */
export async function loadAgent(userId: string): Promise<AgentWithRelations> {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    include: includeRelations,
  });
  if (!agent) throw NotFound("Agente nao encontrado");
  return agent;
}

/** Retorna o agentId do usuario (sem carregar tudo). */
export async function getAgentId(userId: string): Promise<string> {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!agent) throw NotFound("Agente nao encontrado");
  return agent.id;
}

export async function getSettings(userId: string): Promise<AgentSettingsDTO> {
  return toAgentSettingsDTO(await loadAgent(userId));
}

export async function updateProfile(
  userId: string,
  input: UpdateAgentProfileInput
): Promise<AgentSettingsDTO> {
  const agent = await loadAgent(userId);
  await prisma.agent.update({
    where: { id: agent.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
  });
  return getSettings(userId);
}

export async function updateBasePersonality(
  userId: string,
  personality: PersonalityInput
): Promise<AgentSettingsDTO> {
  const agent = await loadAgent(userId);
  await prisma.agent.update({
    where: { id: agent.id },
    data: { basePersonality: asJson(personality) },
  });
  await logActivity(userId, "personality", "Personalidade do assistente atualizada");
  return getSettings(userId);
}

export async function updateBaseInstructions(
  userId: string,
  instructions: string
): Promise<AgentSettingsDTO> {
  const agent = await loadAgent(userId);
  await prisma.agent.update({
    where: { id: agent.id },
    data: { baseInstructions: instructions },
  });
  await logActivity(userId, "config", "Instruções do assistente atualizadas");
  return getSettings(userId);
}

export async function updateChannel(
  userId: string,
  channelId: "whatsapp" | "personalUse",
  input: UpdateChannelInput
): Promise<AgentSettingsDTO> {
  const agent = await loadAgent(userId);

  await prisma.channelConfig.update({
    where: { agentId_channelId: { agentId: agent.id, channelId } },
    data: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.useSharedPersonality !== undefined
        ? { useSharedPersonality: input.useSharedPersonality }
        : {}),
      ...(input.useSharedKnowledgeBase !== undefined
        ? { useSharedKnowledgeBase: input.useSharedKnowledgeBase }
        : {}),
      ...(input.personality !== undefined
        ? { personality: asJson(input.personality) }
        : {}),
      ...(input.instructions !== undefined
        ? { instructions: input.instructions }
        : {}),
    },
  });

  if (input.enabled !== undefined && channelId === "personalUse") {
    await logActivity(
      userId,
      "config",
      input.enabled ? "Uso pessoal ativado" : "Uso pessoal desativado"
    );
  }

  return getSettings(userId);
}
