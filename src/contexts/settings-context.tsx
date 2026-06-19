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
import type { AgentSettings } from "@/types";

interface SettingsContextValue {
  settings: AgentSettings;
  toggleWhatsApp: (enabled: boolean) => void;
  reconnectWhatsApp: () => void;
  togglePersonalUse: (enabled: boolean) => void;
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
      setSettings((prev) => ({ ...prev, personalUse: { enabled } }));
    },
    [setSettings]
  );

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, toggleWhatsApp, reconnectWhatsApp, togglePersonalUse }),
    [settings, toggleWhatsApp, reconnectWhatsApp, togglePersonalUse]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings deve ser usado dentro de SettingsProvider");
  return ctx;
}
