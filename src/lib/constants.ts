export const APP_NAME = "FlowAssist";

export const STORAGE_KEYS = {
  auth: "flowassist_auth",
  settings: "flowassist_settings",
  chat: "flowassist_chat",
  theme: "flowassist_theme",
  onboarding: "flowassist_onboarding",
} as const;

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
