import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants";
import type {
  AgentPersonality,
  AgentSettings,
  ChannelId,
  Conversation,
  KnowledgeFile,
  Message,
  Plan,
  Subscription,
  User,
  Activity,
} from "@/types";

/** Erro de API com status HTTP e mensagem amigavel vinda do backend. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// --- Gerenciamento do token JWT ---

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEYS.token);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Quando true, envia FormData (upload) sem Content-Type JSON. */
  formData?: FormData;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message =
      (data && (data.error as string)) || `Erro ${response.status}`;
    throw new ApiError(response.status, message, data?.details);
  }

  return data as T;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      }),
    me: () => request<User>("/api/auth/me"),
    updateProfile: (data: Partial<Pick<User, "name" | "avatarUrl">>) =>
      request<User>("/api/auth/profile", { method: "PUT", body: data }),
    logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  },

  agent: {
    get: () => request<AgentSettings>("/api/agent"),
    updateProfile: (patch: {
      name?: string;
      description?: string;
      status?: string;
      avatarUrl?: string;
    }) => request<AgentSettings>("/api/agent/profile", { method: "PUT", body: patch }),
    updateBasePersonality: (personality: AgentPersonality) =>
      request<AgentSettings>("/api/agent/personality/base", {
        method: "PUT",
        body: personality,
      }),
    updateBaseInstructions: (instructions: string) =>
      request<AgentSettings>("/api/agent/instructions/base", {
        method: "PUT",
        body: { instructions },
      }),
    updateChannel: (
      channelId: ChannelId,
      patch: {
        enabled?: boolean;
        useSharedPersonality?: boolean;
        useSharedKnowledgeBase?: boolean;
        personality?: AgentPersonality;
        instructions?: string;
      }
    ) =>
      request<AgentSettings>(`/api/agent/channels/${channelId}`, {
        method: "PUT",
        body: patch,
      }),
    whatsappStatus: () =>
      request<{
        connectionStatus: string;
        phoneNumber?: string;
        connectedAt?: string;
        qrCode?: string;
      }>("/api/agent/whatsapp/status"),
    whatsappConnect: () =>
      request<{ connectionStatus: string; phoneNumber?: string; qrCode?: string }>(
        "/api/agent/whatsapp/connect",
        { method: "POST" }
      ),
    whatsappReconnect: () =>
      request<{ connectionStatus: string }>("/api/agent/whatsapp/reconnect", {
        method: "POST",
      }),
    whatsappDisconnect: () =>
      request<{ connectionStatus: string }>("/api/agent/whatsapp/disconnect", {
        method: "POST",
      }),
  },

  knowledge: {
    list: () => request<KnowledgeFile[]>("/api/knowledge/files"),
    upload: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<KnowledgeFile>("/api/knowledge/files", {
        method: "POST",
        formData: form,
      });
    },
    get: (id: string) => request<KnowledgeFile>(`/api/knowledge/files/${id}`),
    remove: (id: string) =>
      request<{ ok: boolean }>(`/api/knowledge/files/${id}`, { method: "DELETE" }),
    retry: (id: string) =>
      request<KnowledgeFile>(`/api/knowledge/files/${id}/retry`, {
        method: "POST",
      }),
  },

  chat: {
    listConversations: () => request<Conversation[]>("/api/conversations"),
    createConversation: () =>
      request<Conversation>("/api/conversations", { method: "POST" }),
    getConversation: (id: string) =>
      request<{ conversation: Conversation; messages: Message[] }>(
        `/api/conversations/${id}`
      ),
    getMessages: (id: string) =>
      request<Message[]>(`/api/conversations/${id}/messages`),
    deleteConversation: (id: string) =>
      request<{ ok: boolean }>(`/api/conversations/${id}`, { method: "DELETE" }),
    sendMessage: (id: string, content: string) =>
      request<{ userMessage: Message; assistantMessage: Message }>(
        `/api/conversations/${id}/messages`,
        { method: "POST", body: { content } }
      ),
  },

  subscription: {
    get: () => request<Subscription>("/api/subscription"),
    update: (plan: string) =>
      request<Subscription>("/api/subscription", { method: "PUT", body: { plan } }),
  },

  plans: {
    list: () => request<Plan[]>("/api/plans"),
  },

  activities: {
    list: () => request<Activity[]>("/api/activities"),
  },
};
