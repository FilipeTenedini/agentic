import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { DEMO_SETTINGS, MOCK_PHONE_NUMBER } from "@/mocks/agent-settings";
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
  const [settings, setSettings] = useLocalStorage<AgentSettings>(
    STORAGE_KEYS.settings,
    DEMO_SETTINGS
  );
  const timers = useRef<number[]>([]);

  const runConnectingFlow = useCallback(() => {
    const timer = window.setTimeout(() => {
      setSettings((prev) => ({
        ...prev,
        whatsapp: {
          ...prev.whatsapp,
          connectionStatus: "connected",
          phoneNumber: prev.whatsapp.phoneNumber ?? MOCK_PHONE_NUMBER,
          connectedAt: new Date().toISOString(),
        },
      }));
    }, 1500);
    timers.current.push(timer);
  }, [setSettings]);

  const toggleWhatsApp = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        setSettings((prev) => ({
          ...prev,
          whatsapp: {
            ...prev.whatsapp,
            enabled: true,
            connectionStatus: "connecting",
          },
        }));
        runConnectingFlow();
      } else {
        setSettings((prev) => ({
          ...prev,
          whatsapp: {
            ...prev.whatsapp,
            enabled: false,
            connectionStatus: "disconnected",
          },
        }));
      }
    },
    [setSettings, runConnectingFlow]
  );

  const reconnectWhatsApp = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      whatsapp: { ...prev.whatsapp, connectionStatus: "reconnecting" },
    }));
    const timer = window.setTimeout(() => {
      setSettings((prev) => ({
        ...prev,
        whatsapp: {
          ...prev.whatsapp,
          connectionStatus: "connected",
          connectedAt: new Date().toISOString(),
        },
      }));
    }, 1500);
    timers.current.push(timer);
  }, [setSettings]);

  const togglePersonalUse = useCallback(
    (enabled: boolean) => {
      setSettings((prev) => ({
        ...prev,
        personalUse: { ...prev.personalUse, enabled },
      }));
    },
    [setSettings]
  );

  const updateAgentProfile = useCallback(
    (patch: Partial<AgentProfile>) => {
      setSettings((prev) => ({ ...prev, agent: { ...prev.agent, ...patch } }));
    },
    [setSettings]
  );

  const updateBasePersonality = useCallback(
    (patch: Partial<AgentPersonality>) => {
      setSettings((prev) => ({
        ...prev,
        basePersonality: { ...prev.basePersonality, ...patch },
      }));
    },
    [setSettings]
  );

  const setBasePersonality = useCallback(
    (personality: AgentPersonality) => {
      setSettings((prev) => ({ ...prev, basePersonality: personality }));
    },
    [setSettings]
  );

  const updateBaseInstructions = useCallback(
    (instructions: string) => {
      setSettings((prev) => ({ ...prev, baseInstructions: instructions }));
    },
    [setSettings]
  );

  const updateChannelConfig = useCallback(
    (channelId: ChannelId, patch: Partial<ChannelConfigBase>) => {
      setSettings((prev) => ({
        ...prev,
        [channelId]: { ...prev[channelId], ...patch },
      }));
    },
    [setSettings]
  );

  const setChannelPersonality = useCallback(
    (channelId: ChannelId, personality: AgentPersonality) => {
      setSettings((prev) => ({
        ...prev,
        [channelId]: { ...prev[channelId], personality },
      }));
    },
    [setSettings]
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
