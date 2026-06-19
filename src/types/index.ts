export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export interface AgentSettings {
  whatsapp: {
    enabled: boolean;
    phoneNumber?: string;
    connectionStatus: ConnectionStatus;
    connectedAt?: string;
  };
  personalUse: {
    enabled: boolean;
  };
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export type PlanId = "free" | "starter" | "pro" | "business";

export interface UsageLimit {
  used: number;
  max: number;
}

export interface Subscription {
  plan: PlanId;
  planName: string;
  price: number;
  currency: "BRL";
  renewalDate: string;
  status: "active" | "past_due" | "canceled";
  limits: {
    whatsappMessages: UsageLimit;
    chatMessages: UsageLimit;
    conversations: UsageLimit;
  };
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export type ActivityType = "whatsapp" | "chat" | "config";

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
