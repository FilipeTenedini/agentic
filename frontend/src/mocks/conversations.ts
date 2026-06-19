import type { Conversation, Message } from "@/types";

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-001",
    title: "Ideias para post Instagram",
    lastMessage: "Claro! Aqui estão 3 ideias criativas para sua promoção de verão.",
    lastMessageAt: "2025-06-18T14:30:00Z",
    messageCount: 4,
  },
  {
    id: "conv-002",
    title: "Rascunho de email cliente",
    lastMessage: "Segue o rascunho revisado, com um tom mais cordial.",
    lastMessageAt: "2025-06-17T09:15:00Z",
    messageCount: 6,
  },
  {
    id: "conv-003",
    title: "Resumo da reunião",
    lastMessage: "Os principais pontos foram alinhados e organizados em tópicos.",
    lastMessageAt: "2025-06-15T16:45:00Z",
    messageCount: 4,
  },
  {
    id: "conv-004",
    title: "Roteiro de vendas",
    lastMessage: "Para abordagem inicial, sugiro começar pela dor do cliente.",
    lastMessageAt: "2025-06-14T11:00:00Z",
    messageCount: 5,
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  "conv-001": [
    {
      id: "msg-001-1",
      conversationId: "conv-001",
      role: "user",
      content: "Preciso de ideias para post no Instagram sobre promoção de verão.",
      createdAt: "2025-06-18T14:25:00Z",
    },
    {
      id: "msg-001-2",
      conversationId: "conv-001",
      role: "assistant",
      content:
        "Claro! Aqui estão 3 ideias criativas para sua promoção de verão:\n\n1. Carrossel \"Kit Verão\" mostrando combos com desconto progressivo.\n2. Reels rápido com a contagem regressiva da oferta.\n3. Post \"antes e depois\" destacando o benefício do produto na estação.",
      createdAt: "2025-06-18T14:26:00Z",
    },
    {
      id: "msg-001-3",
      conversationId: "conv-001",
      role: "user",
      content: "Gostei da segunda, pode expandir?",
      createdAt: "2025-06-18T14:29:00Z",
    },
    {
      id: "msg-001-4",
      conversationId: "conv-001",
      role: "assistant",
      content:
        "Perfeito! Para o Reels da contagem regressiva: abra com um texto grande \"Últimas 48h\", mostre 3 produtos em destaque com o preço promocional, use uma trilha animada e finalize com um CTA claro: \"Link na bio\".",
      createdAt: "2025-06-18T14:30:00Z",
    },
  ],
  "conv-002": [
    {
      id: "msg-002-1",
      conversationId: "conv-002",
      role: "user",
      content: "Preciso escrever um email para um cliente que atrasou o pagamento.",
      createdAt: "2025-06-17T09:05:00Z",
    },
    {
      id: "msg-002-2",
      conversationId: "conv-002",
      role: "assistant",
      content:
        "Entendi. Sugiro um tom cordial e objetivo. Quer que eu inclua uma proposta de parcelamento como alternativa?",
      createdAt: "2025-06-17T09:06:00Z",
    },
    {
      id: "msg-002-3",
      conversationId: "conv-002",
      role: "user",
      content: "Sim, e mantenha curto.",
      createdAt: "2025-06-17T09:12:00Z",
    },
    {
      id: "msg-002-4",
      conversationId: "conv-002",
      role: "assistant",
      content:
        "Segue o rascunho revisado, com um tom mais cordial:\n\n\"Olá, [Nome]! Notamos que a fatura de junho ainda está em aberto. Caso prefira, podemos dividir o valor em até 3x. Fico à disposição para ajudar. Abraço!\"",
      createdAt: "2025-06-17T09:15:00Z",
    },
  ],
  "conv-003": [
    {
      id: "msg-003-1",
      conversationId: "conv-003",
      role: "user",
      content: "Resuma os pontos principais da reunião de hoje sobre o lançamento.",
      createdAt: "2025-06-15T16:40:00Z",
    },
    {
      id: "msg-003-2",
      conversationId: "conv-003",
      role: "assistant",
      content:
        "Os principais pontos foram:\n\n- Data de lançamento confirmada para 01/07.\n- Responsável pelo material de marketing definido.\n- Pendência: aprovar o orçamento de mídia paga.",
      createdAt: "2025-06-15T16:45:00Z",
    },
  ],
  "conv-004": [
    {
      id: "msg-004-1",
      conversationId: "conv-004",
      role: "user",
      content: "Me ajude a montar um roteiro de vendas para abordagem por telefone.",
      createdAt: "2025-06-14T10:55:00Z",
    },
    {
      id: "msg-004-2",
      conversationId: "conv-004",
      role: "assistant",
      content:
        "Para abordagem inicial, sugiro começar pela dor do cliente: apresente-se rapidamente, faça uma pergunta de diagnóstico e só depois apresente a solução.",
      createdAt: "2025-06-14T11:00:00Z",
    },
  ],
};

export const MOCK_ASSISTANT_REPLIES = [
  "Entendi! Posso ajudar com isso. Deixe-me elaborar uma sugestão para você.",
  "Ótima pergunta! Aqui está o que eu sugiro como próximo passo.",
  "Claro! Baseado no que você descreveu, eu seguiria por este caminho.",
  "Vou preparar isso para você. Aqui vai um primeiro rascunho.",
];
