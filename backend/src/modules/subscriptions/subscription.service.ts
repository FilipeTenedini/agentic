import { prisma } from "../../infra/prisma.js";
import { NotFound } from "../../infra/http/errors.js";
import { PLAN_CATALOG, PLAN_IDS, getPlan, type PlanId } from "./plans.catalog.js";
import {
  toSubscriptionDTO,
  type SubscriptionDTO,
} from "./subscription.mapper.js";

export interface PlanDTO {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export function listPlans(): PlanDTO[] {
  return PLAN_IDS.map((id) => {
    const p = PLAN_CATALOG[id];
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      features: p.features,
      ...(p.highlighted ? { highlighted: true } : {}),
    };
  });
}

export async function getSubscription(userId: string): Promise<SubscriptionDTO> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw NotFound("Assinatura nao encontrada");
  return toSubscriptionDTO(sub);
}

export async function updatePlan(
  userId: string,
  planId: PlanId
): Promise<SubscriptionDTO> {
  const plan = getPlan(planId);
  const sub = await prisma.subscription.update({
    where: { userId },
    data: {
      plan: plan.id,
      whatsappMsgsMax: plan.limits.whatsappMessages,
      chatMsgsMax: plan.limits.chatMessages,
      conversationsMax: plan.limits.conversations,
    },
  });
  return toSubscriptionDTO(sub);
}
