import { ROUTES } from "@/lib/constants";
import type { AgentSettings, AgentStatus } from "@/types";

export interface PendingSetupItem {
  id: string;
  label: string;
  to: string;
}

interface KnowledgeSummaryLike {
  ready: number;
  total: number;
}

/**
 * Regras simples (mockadas) para sugerir o que falta configurar no agente.
 * Usado tanto na Visão Geral do "Meu Agente" quanto no Dashboard.
 */
export function getPendingSetup(
  settings: AgentSettings,
  knowledge: KnowledgeSummaryLike
): PendingSetupItem[] {
  const items: PendingSetupItem[] = [];

  const noChannel = !settings.whatsapp.enabled && !settings.personalUse.enabled;
  if (noChannel) {
    items.push({
      id: "channels",
      label: "Ative pelo menos um canal (WhatsApp ou Uso pessoal)",
      to: `${ROUTES.agent}?tab=channels`,
    });
  }

  if (settings.baseInstructions.trim().length === 0) {
    items.push({
      id: "instructions",
      label: "Defina as instruções do assistente",
      to: `${ROUTES.agent}?tab=instructions`,
    });
  }

  if (knowledge.ready === 0) {
    items.push({
      id: "knowledge",
      label: "Adicione arquivos à base de conhecimento",
      to: `${ROUTES.agent}?tab=knowledge`,
    });
  }

  return items;
}

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  draft: "Em configuração",
  active: "Ativo",
  paused: "Pausado",
};

export const AGENT_STATUS_VARIANT: Record<
  AgentStatus,
  "success" | "secondary" | "warning"
> = {
  draft: "secondary",
  active: "success",
  paused: "warning",
};
