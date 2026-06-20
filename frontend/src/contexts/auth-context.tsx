import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { api, ApiError, clearToken, getToken, setToken } from "@/lib/api";
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
  updateProfile: (data: Partial<Pick<User, "name" | "avatarUrl">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // O usuario fica em cache no localStorage para evitar "flash" de logout no
  // primeiro render; o token JWT e a fonte da verdade da sessao.
  const [user, setUser] = useLocalStorage<User | null>(STORAGE_KEYS.auth, null);

  // Ao montar, se ha token, revalida a sessao com o backend.
  useEffect(() => {
    if (!getToken()) {
      if (user) setUser(null);
      return;
    }
    api.auth
      .me()
      .then((fresh) => setUser(fresh))
      .catch(() => {
        clearToken();
        setUser(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const { token, user: loggedUser } = await api.auth.login(email, password);
        setToken(token);
        setUser(loggedUser);
        return { ok: true };
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Falha ao entrar. Tente novamente.";
        return { ok: false, error: message };
      }
    },
    [setUser]
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      try {
        const { token, user: newUser } = await api.auth.register(
          name,
          email,
          password
        );
        setToken(token);
        setUser(newUser);
        return { ok: true };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Falha ao criar a conta. Tente novamente.";
        return { ok: false, error: message };
      }
    },
    [setUser]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, [setUser]);

  const updateProfile = useCallback(
    async (data: Partial<Pick<User, "name" | "avatarUrl">>) => {
      const updated = await api.auth.updateProfile(data);
      setUser(updated);
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
