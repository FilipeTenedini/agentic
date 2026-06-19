import {
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  requiresPersonalUse?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Meu Agente", to: ROUTES.agent, icon: Sparkles },
  { label: "Chat", to: ROUTES.chat, icon: MessageSquare, requiresPersonalUse: true },
  { label: "Configurações", to: ROUTES.settings, icon: Settings },
  { label: "Perfil", to: ROUTES.profile, icon: User },
  { label: "Assinatura", to: ROUTES.subscription, icon: CreditCard },
  { label: "Ajuda", to: ROUTES.help, icon: HelpCircle },
];
