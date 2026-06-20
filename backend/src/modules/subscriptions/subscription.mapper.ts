import type { Subscription } from "@prisma/client";
import { getPlan } from "./plans.catalog.js";

export interface SubscriptionDTO {
  plan: string;
  planName: string;
  price: number;
  currency: "BRL";
  renewalDate: string;
  status: string;
  limits: {
    whatsappMessages: { used: number; max: number };
    chatMessages: { used: number; max: number };
    conversations: { used: number; max: number };
  };
}

export function toSubscriptionDTO(sub: Subscription): SubscriptionDTO {
  const plan = getPlan(sub.plan);
  return {
    plan: sub.plan,
    planName: plan.name,
    price: plan.price,
    currency: "BRL",
    renewalDate: (sub.renewalAt ?? new Date()).toISOString(),
    status: sub.status,
    limits: {
      whatsappMessages: { used: sub.whatsappMsgsUsed, max: sub.whatsappMsgsMax },
      chatMessages: { used: sub.chatMsgsUsed, max: sub.chatMsgsMax },
      conversations: { used: sub.conversationsUsed, max: sub.conversationsMax },
    },
  };
}
