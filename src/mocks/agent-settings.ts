import type { AgentSettings } from "@/types";

export const DEMO_SETTINGS: AgentSettings = {
  whatsapp: {
    enabled: true,
    phoneNumber: "+55 11 98765-4321",
    connectionStatus: "connected",
    connectedAt: "2025-06-18T10:00:00Z",
  },
  personalUse: {
    enabled: true,
  },
};

export const INITIAL_SETTINGS: AgentSettings = {
  whatsapp: {
    enabled: false,
    connectionStatus: "disconnected",
  },
  personalUse: {
    enabled: false,
  },
};

export const MOCK_PHONE_NUMBER = "+55 11 98765-4321";
