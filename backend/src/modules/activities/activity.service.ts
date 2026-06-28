import { prisma } from "../../infra/prisma.js";
import { logger } from "../../shared/utils/logger.js";

const log = logger.child("activity");

export type ActivityType =
  | "whatsapp"
  | "chat"
  | "config"
  | "knowledge"
  | "personality";

export interface ActivityDTO {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

/**
 * Registra uma atividade no feed do dashboard. Fire-and-forget seguro:
 * falhas aqui nao devem quebrar a operacao principal.
 */
export async function logActivity(
  userId: string,
  type: ActivityType,
  description: string
): Promise<void> {
  try {
    await prisma.activity.create({ data: { userId, type, description } });
  } catch (err) {
    log.error("Falha ao registrar atividade", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function listActivities(
  userId: string,
  limit = 12
): Promise<ActivityDTO[]> {
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return activities.map((a) => ({
    id: a.id,
    type: a.type as ActivityType,
    description: a.description,
    timestamp: a.createdAt.toISOString(),
  }));
}
