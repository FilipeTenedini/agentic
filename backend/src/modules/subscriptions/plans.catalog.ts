export type PlanId = "free" | "starter" | "pro" | "business";

/** Limite "ilimitado" representado por um numero grande (planos Business). */
export const UNLIMITED = 999_999;

export interface PlanLimits {
  whatsappMessages: number;
  chatMessages: number;
  conversations: number;
}

export interface PlanCatalogItem {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  limits: PlanLimits;
}

/**
 * Catalogo estatico de planos. Espelha frontend/src/mocks/subscription.ts
 * (PLANS) e a tabela de limites de PRODUTO.md / PLANEJAMENTO.md.
 */
export const PLAN_CATALOG: Record<PlanId, PlanCatalogItem> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    description: "Para experimentar a plataforma.",
    features: ["100 mensagens WhatsApp", "50 mensagens no chat", "5 conversas"],
    limits: { whatsappMessages: 100, chatMessages: 50, conversations: 5 },
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 97,
    description: "Para começar a automatizar.",
    features: ["1.000 mensagens WhatsApp", "500 mensagens no chat", "50 conversas"],
    highlighted: true,
    limits: { whatsappMessages: 1000, chatMessages: 500, conversations: 50 },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 197,
    description: "Para quem atende em escala.",
    features: ["5.000 mensagens WhatsApp", "2.000 mensagens no chat", "200 conversas"],
    limits: { whatsappMessages: 5000, chatMessages: 2000, conversations: 200 },
  },
  business: {
    id: "business",
    name: "Business",
    price: 497,
    description: "Para operações de alto volume.",
    features: ["Mensagens WhatsApp ilimitadas", "Chat ilimitado", "Conversas ilimitadas"],
    limits: {
      whatsappMessages: UNLIMITED,
      chatMessages: UNLIMITED,
      conversations: UNLIMITED,
    },
  },
};

export const PLAN_IDS: PlanId[] = ["free", "starter", "pro", "business"];

export function getPlan(planId: string): PlanCatalogItem {
  return PLAN_CATALOG[(planId as PlanId)] ?? PLAN_CATALOG.free;
}
