import type {
  Agent,
  ChannelConfig,
  WhatsAppConnection,
} from "@prisma/client";
import type { AgentPersonality } from "../../shared/domain/personality.js";

export interface ChannelConfigDTO {
  enabled: boolean;
  useSharedPersonality: boolean;
  useSharedKnowledgeBase: boolean;
  personality?: AgentPersonality;
  instructions: string;
}

export interface WhatsAppChannelDTO extends ChannelConfigDTO {
  phoneNumber?: string;
  connectionStatus: string;
  connectedAt?: string;
}

/** Espelha exatamente o tipo `AgentSettings` do frontend. */
export interface AgentSettingsDTO {
  agent: {
    name: string;
    avatarUrl?: string;
    status: string;
    description?: string;
  };
  basePersonality: AgentPersonality;
  baseInstructions: string;
  knowledgeBase: { files: [] };
  whatsapp: WhatsAppChannelDTO;
  personalUse: ChannelConfigDTO;
}

export type AgentWithRelations = Agent & {
  channels: ChannelConfig[];
  whatsappConnection: WhatsAppConnection | null;
};

function toChannelBase(channel?: ChannelConfig): ChannelConfigDTO {
  return {
    enabled: channel?.enabled ?? false,
    useSharedPersonality: channel?.useSharedPersonality ?? false,
    useSharedKnowledgeBase: channel?.useSharedKnowledgeBase ?? true,
    personality: (channel?.personality as AgentPersonality | null) ?? undefined,
    instructions: channel?.instructions ?? "",
  };
}

export function toAgentSettingsDTO(agent: AgentWithRelations): AgentSettingsDTO {
  const whatsappChannel = agent.channels.find((c) => c.channelId === "whatsapp");
  const personalChannel = agent.channels.find(
    (c) => c.channelId === "personalUse"
  );
  const conn = agent.whatsappConnection;

  return {
    agent: {
      name: agent.name,
      avatarUrl: agent.avatarUrl ?? undefined,
      status: agent.status,
      description: agent.description ?? undefined,
    },
    basePersonality: agent.basePersonality as unknown as AgentPersonality,
    baseInstructions: agent.baseInstructions,
    knowledgeBase: { files: [] },
    whatsapp: {
      ...toChannelBase(whatsappChannel),
      phoneNumber: conn?.phoneNumber ?? undefined,
      connectionStatus: conn?.connectionStatus ?? "disconnected",
      connectedAt: conn?.connectedAt?.toISOString(),
    },
    personalUse: toChannelBase(personalChannel),
  };
}
