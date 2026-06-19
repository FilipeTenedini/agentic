import type { Plan, Subscription } from "@/types";

export const DEMO_SUBSCRIPTION: Subscription = {
  plan: "starter",
  planName: "Starter",
  price: 97,
  currency: "BRL",
  renewalDate: "2025-07-18",
  status: "active",
  limits: {
    whatsappMessages: { used: 450, max: 1000 },
    chatMessages: { used: 120, max: 500 },
    conversations: { used: 8, max: 50 },
  },
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Para experimentar a plataforma.",
    features: ["100 mensagens WhatsApp", "50 mensagens no chat", "5 conversas"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 97,
    description: "Para começar a automatizar.",
    features: ["1.000 mensagens WhatsApp", "500 mensagens no chat", "50 conversas"],
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 197,
    description: "Para quem atende em escala.",
    features: ["5.000 mensagens WhatsApp", "2.000 mensagens no chat", "200 conversas"],
  },
  {
    id: "business",
    name: "Business",
    price: 497,
    description: "Para operações de alto volume.",
    features: ["Mensagens WhatsApp ilimitadas", "Chat ilimitado", "Conversas ilimitadas"],
  },
];
