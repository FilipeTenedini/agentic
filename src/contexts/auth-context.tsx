import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEMO_CREDENTIALS, STORAGE_KEYS } from "@/lib/constants";
import { createMockUser, DEMO_USER } from "@/mocks/users";
import type { User } from "@/types";

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "avatarUrl">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>(STORAGE_KEYS.auth, null);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      await delay(700);
      const normalized = email.trim().toLowerCase();
      if (
        normalized === DEMO_CREDENTIALS.email &&
        password === DEMO_CREDENTIALS.password
      ) {
        setUser(DEMO_USER);
        return { ok: true };
      }
      // MVP mock: aceita qualquer email válido com senha >= 8 como nova conta
      if (normalized.includes("@") && password.length >= 8) {
        setUser(createMockUser(normalized.split("@")[0], normalized));
        return { ok: true };
      }
      return { ok: false, error: "Email ou senha inválidos." };
    },
    [setUser]
  );

  const register = useCallback(
    async (name: string, email: string, _password: string): Promise<AuthResult> => {
      await delay(800);
      setUser(createMockUser(name.trim(), email.trim().toLowerCase()));
      return { ok: true };
    },
    [setUser]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const updateProfile = useCallback(
    (data: Partial<Pick<User, "name" | "avatarUrl">>) => {
      setUser((prev) => (prev ? { ...prev, ...data } : prev));
    },
    [setUser]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
