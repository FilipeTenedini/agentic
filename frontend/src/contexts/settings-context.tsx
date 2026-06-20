import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { INITIAL_SETTINGS } from "@/mocks/agent-settings";
import type {
  AgentPersonality,
  AgentProfile,
  AgentSettings,
  ChannelId,
  ChannelConfigBase,
} from "@/types";

interface SettingsContextValue {
  settings: AgentSettings;
  toggleWhatsApp: (enabled: boolean) => void;
  reconnectWhatsApp: () => void;
  togglePersonalUse: (enabled: boolean) => void;
  updateAgentProfile: (patch: Partial<AgentProfile>) => void;
  updateBasePersonality: (patch: Partial<AgentPersonality>) => void;
  setBasePersonality: (personality: AgentPersonality) => void;
  updateBaseInstructions: (instructions: string) => void;
  updateChannelConfig: (
    channelId: ChannelId,
    patch: Partial<ChannelConfigBase>
  ) => void;
  setChannelPersonality: (
    channelId: ChannelId,
    personality: AgentPersonality
  ) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<AgentSettings>(INITIAL_SETTINGS);
  const pollRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const fresh = await api.agent.get();
      setSettings(fresh);
    } catch (err) {
      console.error("Falha ao carregar configuracoes do agente:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    } else {
      setSettings(INITIAL_SETTINGS);
    }
    return () => {
      if (pollRef.current) window.clearTimeout(pollRef.current);
    };
  }, [isAuthenticated, refresh]);

  // Atualiza o estado local de forma otimista e reconcilia com o servidor.
  const optimistic = useCallback(
    (
      updater: (prev: AgentSettings) => AgentSettings,
      apiCall: () => Promise<AgentSettings>
    ) => {
      setSettings(updater);
      apiCall()
        .then((server) => setSettings(server))
        .catch((err) => {
          console.error("Falha ao salvar configuracao:", err);
          void refresh();
        });
    },
    [refresh]
  );

  // --- WhatsApp: polling do status durante connecting/reconnecting ---
  const pollWhatsAppStatus = useCallback((attempt = 0) => {
    if (attempt > 15) return;
    pollRef.current = window.setTimeout(async () => {
      try {
        const status = await api.agent.whatsappStatus();
        setSettings((prev) => ({
          ...prev,
          whatsapp: {
            ...prev.whatsapp,
            connectionStatus:
              status.connectionStatus as AgentSettings["whatsapp"]["connectionStatus"],
            phoneNumber: status.phoneNumber ?? prev.whatsapp.phoneNumber,
            connectedAt: status.connectedAt ?? prev.whatsapp.connectedAt,
          },
        }));
        if (
          status.connectionStatus === "connecting" ||
          status.connectionStatus === "reconnecting"
        ) {
          pollWhatsAppStatus(attempt + 1);
        }
      } catch (err) {
        console.error("Falha ao consultar status do WhatsApp:", err);
      }
    }, 800);
  }, []);

  const toggleWhatsApp = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        setSettings((prev) => ({
          ...prev,
          whatsapp: { ...prev.whatsapp, enabled: true, connectionStatus: "connecting" },
        }));
        api.agent
          .whatsappConnect()
          .then(() => pollWhatsAppStatus())
          .catch((err) => {
            console.error("Falha ao conectar WhatsApp:", err);
            void refresh();
          });
      } else {
        setSettings((prev) => ({
          ...prev,
          whatsapp: {
            ...prev.whatsapp,
            enabled: false,
            connectionStatus: "disconnected",
          },
        }));
        api.agent.whatsappDisconnect().catch((err) => {
          console.error("Falha ao desconectar WhatsApp:", err);
          void refresh();
        });
      }
    },
    [pollWhatsAppStatus, refresh]
  );

  const reconnectWhatsApp = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      whatsapp: { ...prev.whatsapp, connectionStatus: "reconnecting" },
    }));
    api.agent
      .whatsappReconnect()
      .then(() => pollWhatsAppStatus())
      .catch((err) => {
        console.error("Falha ao reconectar WhatsApp:", err);
        void refresh();
      });
  }, [pollWhatsAppStatus, refresh]);

  const togglePersonalUse = useCallback(
    (enabled: boolean) => {
      optimistic(
        (prev) => ({ ...prev, personalUse: { ...prev.personalUse, enabled } }),
        () => api.agent.updateChannel("personalUse", { enabled })
      );
    },
    [optimistic]
  );

  const updateAgentProfile = useCallback(
    (patch: Partial<AgentProfile>) => {
      optimistic(
        (prev) => ({ ...prev, agent: { ...prev.agent, ...patch } }),
        () => api.agent.updateProfile(patch)
      );
    },
    [optimistic]
  );

  const updateBasePersonality = useCallback(
    (patch: Partial<AgentPersonality>) => {
      setSettings((prev) => {
        const merged = { ...prev.basePersonality, ...patch };
        api.agent
          .updateBasePersonality(merged)
          .then((server) => setSettings(server))
          .catch((err) => {
            console.error("Falha ao salvar personalidade:", err);
            void refresh();
          });
        return { ...prev, basePersonality: merged };
      });
    },
    [refresh]
  );

  const setBasePersonality = useCallback(
    (personality: AgentPersonality) => {
      optimistic(
        (prev) => ({ ...prev, basePersonality: personality }),
        () => api.agent.updateBasePersonality(personality)
      );
    },
    [optimistic]
  );

  const updateBaseInstructions = useCallback(
    (instructions: string) => {
      optimistic(
        (prev) => ({ ...prev, baseInstructions: instructions }),
        () => api.agent.updateBaseInstructions(instructions)
      );
    },
    [optimistic]
  );

  const updateChannelConfig = useCallback(
    (channelId: ChannelId, patch: Partial<ChannelConfigBase>) => {
      optimistic(
        (prev) => ({ ...prev, [channelId]: { ...prev[channelId], ...patch } }),
        () => api.agent.updateChannel(channelId, patch)
      );
    },
    [optimistic]
  );

  const setChannelPersonality = useCallback(
    (channelId: ChannelId, personality: AgentPersonality) => {
      optimistic(
        (prev) => ({
          ...prev,
          [channelId]: { ...prev[channelId], personality },
        }),
        () => api.agent.updateChannel(channelId, { personality })
      );
    },
    [optimistic]
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      toggleWhatsApp,
      reconnectWhatsApp,
      togglePersonalUse,
      updateAgentProfile,
      updateBasePersonality,
      setBasePersonality,
      updateBaseInstructions,
      updateChannelConfig,
      setChannelPersonality,
    }),
    [
      settings,
      toggleWhatsApp,
      reconnectWhatsApp,
      togglePersonalUse,
      updateAgentProfile,
      updateBasePersonality,
      setBasePersonality,
      updateBaseInstructions,
      updateChannelConfig,
      setChannelPersonality,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings deve ser usado dentro de SettingsProvider");
  return ctx;
}
