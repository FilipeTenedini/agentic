export const APP_NAME = "FlowAssist";

export const STORAGE_KEYS = {
  auth: "flowassist_auth",
  // Token JWT retornado pelo backend (enviado em Authorization: Bearer).
  token: "flowassist_token",
  // v2: o shape de AgentSettings mudou (personalidade, base de conhecimento e
  // configuração por canal). Subir a versão evita que dados antigos quebrem a UI.
  settings: "flowassist_settings_v2",
  knowledge: "flowassist_knowledge_v1",
  chat: "flowassist_chat",
  theme: "flowassist_theme",
  onboarding: "flowassist_onboarding",
} as const;

/** Base da API do backend (Vite env). Default aponta para o backend local. */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3000";

export const DEMO_CREDENTIALS = {
  email: "demo@flowassist.com",
  password: "demo1234",
} as const;

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/cadastro",
  forgotPassword: "/recuperar-senha",
  dashboard: "/app/dashboard",
  agent: "/app/meu-agente",
  agentOverview: "/app/meu-agente/visao-geral",
  agentPersonality: "/app/meu-agente/personalidade",
  agentKnowledge: "/app/meu-agente/base-de-conhecimento",
  agentInstructions: "/app/meu-agente/instrucoes",
  agentChannels: "/app/meu-agente/canais",
  chat: "/app/chat",
  settings: "/app/configuracoes",
  profile: "/app/perfil",
  subscription: "/app/assinatura",
  help: "/app/ajuda",
} as const;

export const SUPPORT = {
  email: "suporte@flowassist.com",
  hours: "Seg–Sex, 9h–18h",
} as const;
