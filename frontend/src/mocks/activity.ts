import type { Activity } from "@/types";

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "act-000",
    type: "knowledge",
    description: "Arquivo \"Tabela de preços.xlsx\" adicionado à base",
    timestamp: "2025-06-18T16:10:00Z",
  },
  {
    id: "act-001",
    type: "chat",
    description: "Nova conversa iniciada no chat",
    timestamp: "2025-06-18T14:30:00Z",
  },
  {
    id: "act-005",
    type: "personality",
    description: "Personalidade do assistente atualizada",
    timestamp: "2025-06-17T11:20:00Z",
  },
  {
    id: "act-002",
    type: "whatsapp",
    description: "WhatsApp conectado com sucesso",
    timestamp: "2025-06-18T10:00:00Z",
  },
  {
    id: "act-003",
    type: "config",
    description: "Uso pessoal ativado",
    timestamp: "2025-06-17T08:00:00Z",
  },
  {
    id: "act-004",
    type: "whatsapp",
    description: "32 mensagens respondidas no WhatsApp",
    timestamp: "2025-06-16T18:20:00Z",
  },
];
