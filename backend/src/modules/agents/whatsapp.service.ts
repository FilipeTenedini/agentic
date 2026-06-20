import { prisma } from "../../infra/prisma.js";
import { env } from "../../config/env.js";
import { NotFound } from "../../infra/http/errors.js";
import { logActivity } from "../activities/activity.service.js";
import {
  createWhatsAppInstance,
  deleteWhatsAppInstance,
} from "../../infra/integrations/whatsapp.client.js";
import { loadAgent } from "./agent.service.js";
import type { WhatsAppStatusInput } from "./agent.dto.js";

export interface WhatsAppStatusDTO {
  connectionStatus: string;
  phoneNumber?: string;
  connectedAt?: string;
  qrCode?: string;
}

async function readStatus(agentId: string): Promise<WhatsAppStatusDTO> {
  const conn = await prisma.whatsAppConnection.findUnique({
    where: { agentId },
  });
  return {
    connectionStatus: conn?.connectionStatus ?? "disconnected",
    phoneNumber: conn?.phoneNumber ?? undefined,
    connectedAt: conn?.connectedAt?.toISOString(),
    qrCode: conn?.qrCode ?? undefined,
  };
}

/**
 * MOCK_WHATSAPP: agenda a transicao para 'connected' apos 1,5s (espelha a UX
 * de "Conectando..." do frontend). Em modo real, a confirmacao vem por webhook.
 */
function scheduleMockConnected(
  agentId: string,
  userId: string,
  phoneNumber: string
) {
  setTimeout(() => {
    prisma.whatsAppConnection
      .update({
        where: { agentId },
        data: {
          connectionStatus: "connected",
          phoneNumber,
          connectedAt: new Date(),
          qrCode: null,
        },
      })
      .then(() => logActivity(userId, "whatsapp", "WhatsApp conectado com sucesso"))
      .catch((err) => console.error("Mock WhatsApp connect falhou:", err));
  }, 1500);
}

export async function connect(userId: string): Promise<WhatsAppStatusDTO> {
  const agent = await loadAgent(userId);
  const instance = await createWhatsAppInstance(agent.id);

  await prisma.channelConfig.update({
    where: { agentId_channelId: { agentId: agent.id, channelId: "whatsapp" } },
    data: { enabled: true },
  });

  await prisma.whatsAppConnection.update({
    where: { agentId: agent.id },
    data: {
      connectionStatus: "connecting",
      instanceName: instance.instanceName,
      qrCode: instance.qrCode,
      ...(instance.phoneNumber ? { phoneNumber: instance.phoneNumber } : {}),
    },
  });

  if (env.MOCK_WHATSAPP) {
    scheduleMockConnected(
      agent.id,
      userId,
      instance.phoneNumber ?? "+55 11 98765-4321"
    );
  }

  return readStatus(agent.id);
}

export async function reconnect(userId: string): Promise<WhatsAppStatusDTO> {
  const agent = await loadAgent(userId);
  await prisma.whatsAppConnection.update({
    where: { agentId: agent.id },
    data: { connectionStatus: "reconnecting" },
  });

  if (env.MOCK_WHATSAPP) {
    const conn = await prisma.whatsAppConnection.findUnique({
      where: { agentId: agent.id },
    });
    scheduleMockConnected(
      agent.id,
      userId,
      conn?.phoneNumber ?? "+55 11 98765-4321"
    );
  }

  return readStatus(agent.id);
}

export async function disconnect(userId: string): Promise<WhatsAppStatusDTO> {
  const agent = await loadAgent(userId);
  const conn = await prisma.whatsAppConnection.findUnique({
    where: { agentId: agent.id },
  });

  await deleteWhatsAppInstance(conn?.instanceName);

  await prisma.channelConfig.update({
    where: { agentId_channelId: { agentId: agent.id, channelId: "whatsapp" } },
    data: { enabled: false },
  });
  await prisma.whatsAppConnection.update({
    where: { agentId: agent.id },
    data: {
      connectionStatus: "disconnected",
      connectedAt: null,
      qrCode: null,
    },
  });

  return readStatus(agent.id);
}

export async function getStatus(userId: string): Promise<WhatsAppStatusDTO> {
  const agentId = (await loadAgent(userId)).id;
  return readStatus(agentId);
}

export async function getQrCode(userId: string): Promise<{ qrCode: string | null }> {
  const agent = await loadAgent(userId);
  const conn = await prisma.whatsAppConnection.findUnique({
    where: { agentId: agent.id },
  });
  return { qrCode: conn?.qrCode ?? null };
}

/**
 * Callback usado pelo N8N/Evolution para atualizar o status da conexao.
 * Localiza o agente pelo instanceName.
 */
export async function updateConnectionByInstance(
  instanceName: string,
  input: WhatsAppStatusInput
): Promise<WhatsAppStatusDTO> {
  const conn = await prisma.whatsAppConnection.findFirst({
    where: { instanceName },
  });
  if (!conn) throw NotFound("Conexao WhatsApp nao encontrada para a instancia");

  const updated = await prisma.whatsAppConnection.update({
    where: { id: conn.id },
    data: {
      connectionStatus: input.connectionStatus,
      ...(input.phoneNumber !== undefined ? { phoneNumber: input.phoneNumber } : {}),
      ...(input.connectedAt !== undefined
        ? { connectedAt: new Date(input.connectedAt) }
        : {}),
      ...(input.qrCode !== undefined ? { qrCode: input.qrCode } : {}),
    },
  });

  return {
    connectionStatus: updated.connectionStatus,
    phoneNumber: updated.phoneNumber ?? undefined,
    connectedAt: updated.connectedAt?.toISOString(),
    qrCode: updated.qrCode ?? undefined,
  };
}
