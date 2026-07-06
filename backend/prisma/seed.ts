import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/shared/utils/password.js";
import { DEFAULT_PERSONALITY } from "../src/shared/domain/personality.js";
import { asJson } from "../src/shared/utils/json.js";
import { PLAN_CATALOG } from "../src/modules/subscriptions/plans.catalog.js";
import { buildStorageUrl } from "../src/infra/integrations/storage.js";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@flowassist.com";
const MOCK_PHONE_NUMBER = "+55 11 98765-4321";

const DEMO_BASE_INSTRUCTIONS = `Voce e o assistente da empresa. Responda sempre em portugues do Brasil, de forma cordial e natural.

Como responder:
- Mantenha continuidade: cada mensagem continua a conversa anterior.
- Use a base de conhecimento quando houver trechos relevantes; complemente com explicacao clara quando fizer sentido.
- Seja util e direto; evite tom de script de call center.

Como NAO responder:
- Nao repita cumprimentos a cada mensagem.
- Nao invente precos, prazos, numeros ou politicas internas.
- Nao compartilhe dados confidenciais.

Contexto da empresa:
- Atendimento de segunda a sexta, das 9h as 18h.`;

async function main() {
  console.log("Seed: limpando dados demo anteriores...");
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  console.log("Seed: criando usuario demo...");
  const passwordHash = await hashPassword("demo1234");
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      name: "Maria Silva",
      avatarUrl:
        "https://api.dicebear.com/9.x/initials/svg?seed=Maria%20Silva&backgroundColor=7c3aed",
    },
  });

  console.log("Seed: assinatura (starter)...");
  const starter = PLAN_CATALOG.starter;
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: "starter",
      status: "active",
      renewalAt: new Date("2025-07-18T00:00:00Z"),
      whatsappMsgsUsed: 450,
      whatsappMsgsMax: starter.limits.whatsappMessages,
      chatMsgsUsed: 120,
      chatMsgsMax: starter.limits.chatMessages,
      conversationsUsed: 8,
      conversationsMax: starter.limits.conversations,
    },
  });

  console.log("Seed: agente + canais + conexao WhatsApp...");
  const agent = await prisma.agent.create({
    data: {
      userId: user.id,
      name: "Assistente FlowAssist",
      status: "active",
      description:
        "Atende clientes no WhatsApp e ajuda no dia a dia pelo chat interno.",
      baseInstructions: DEMO_BASE_INSTRUCTIONS,
      basePersonality: asJson(DEFAULT_PERSONALITY),
      channels: {
        create: [
          {
            channelId: "whatsapp",
            enabled: true,
            useSharedPersonality: false,
            useSharedKnowledgeBase: true,
            instructions:
              "Seja breve e objetivo. Responda em no máximo 3 frases.\n\nSempre finalize com uma pergunta para engajar o cliente.\n\nEvite listas longas ou formatação Markdown.",
            personality: {
              temperature: 45,
              creativity: 40,
              formality: 50,
              objectivity: 75,
              technicalLevel: 25,
              writingStyle: "conciso",
              emojiUsage: "as_vezes",
              responseLength: "curta",
            },
          },
          {
            channelId: "personalUse",
            enabled: true,
            useSharedPersonality: false,
            useSharedKnowledgeBase: true,
            instructions:
              "Conversa tecnica e continua: aprofunde o assunto em follow-ups sem reiniciar do zero.\n\nUse listas so quando organizarem melhor a resposta; prefira prosa natural.\n\nPriorize dados da base quando existirem; explique conceitos gerais quando ajudar.",
            personality: {
              temperature: 55,
              creativity: 60,
              formality: 65,
              objectivity: 60,
              technicalLevel: 70,
              writingStyle: "detalhado",
              emojiUsage: "nunca",
              responseLength: "longa",
            },
          },
        ],
      },
      whatsappConnection: {
        create: {
          phoneNumber: MOCK_PHONE_NUMBER,
          connectionStatus: "connected",
          connectedAt: new Date("2025-06-18T10:00:00Z"),
        },
      },
    },
  });

  console.log("Seed: base de conhecimento...");
  const demoStorage = (name: string) =>
    buildStorageUrl(user.id, name.replace(/[^a-zA-Z0-9._-]/g, "_"));

  await prisma.knowledgeFile.createMany({
    data: [
      {
        agentId: agent.id,
        name: "Tabela de preços.xlsx",
        type: "xlsx",
        sizeBytes: 96_000,
        status: "ready",
        storageUrl: demoStorage("Tabela_de_precos.xlsx"),
        uploadedAt: new Date("2025-06-15T09:30:00Z"),
        chunks: 48,
        vectors: 48,
        indexedAt: new Date("2025-06-15T09:32:00Z"),
      },
      {
        agentId: agent.id,
        name: "Base de clientes (export).csv",
        type: "csv",
        sizeBytes: 512_000,
        status: "ready",
        storageUrl: demoStorage("Base_de_clientes__export_.csv"),
        uploadedAt: new Date("2025-06-16T14:10:00Z"),
        chunks: 22,
        vectors: 22,
        indexedAt: new Date("2025-06-16T14:11:00Z"),
      },
      {
        agentId: agent.id,
        name: "Estoque atual.xlsx",
        type: "xlsx",
        sizeBytes: 184_320,
        status: "processing",
        progress: 62,
        storageUrl: demoStorage("Estoque_atual.xlsx"),
        uploadedAt: new Date("2025-06-18T16:00:00Z"),
      },
      {
        agentId: agent.id,
        name: "Vendas junho.csv",
        type: "csv",
        sizeBytes: 24_576,
        status: "error",
        storageUrl: demoStorage("Vendas_junho.csv"),
        errorMessage:
          "Não foi possível ler o arquivo. Verifique o formato e tente novamente.",
        uploadedAt: new Date("2025-06-18T16:05:00Z"),
      },
    ],
  });

  console.log("Seed: conversas e mensagens...");
  const conversations: {
    title: string;
    lastMessage: string;
    lastMessageAt: string;
    messages: { role: "user" | "assistant"; content: string; createdAt: string }[];
  }[] = [
    {
      title: "Ideias para post Instagram",
      lastMessage:
        "Claro! Aqui estão 3 ideias criativas para sua promoção de verão.",
      lastMessageAt: "2025-06-18T14:30:00Z",
      messages: [
        {
          role: "user",
          content:
            "Preciso de ideias para post no Instagram sobre promoção de verão.",
          createdAt: "2025-06-18T14:25:00Z",
        },
        {
          role: "assistant",
          content:
            'Claro! Aqui estão 3 ideias criativas para sua promoção de verão:\n\n1. Carrossel "Kit Verão" mostrando combos com desconto progressivo.\n2. Reels rápido com a contagem regressiva da oferta.\n3. Post "antes e depois" destacando o benefício do produto na estação.',
          createdAt: "2025-06-18T14:26:00Z",
        },
        {
          role: "user",
          content: "Gostei da segunda, pode expandir?",
          createdAt: "2025-06-18T14:29:00Z",
        },
        {
          role: "assistant",
          content:
            'Perfeito! Para o Reels da contagem regressiva: abra com um texto grande "Últimas 48h", mostre 3 produtos em destaque com o preço promocional, use uma trilha animada e finalize com um CTA claro: "Link na bio".',
          createdAt: "2025-06-18T14:30:00Z",
        },
      ],
    },
    {
      title: "Rascunho de email cliente",
      lastMessage: "Segue o rascunho revisado, com um tom mais cordial.",
      lastMessageAt: "2025-06-17T09:15:00Z",
      messages: [
        {
          role: "user",
          content:
            "Preciso escrever um email para um cliente que atrasou o pagamento.",
          createdAt: "2025-06-17T09:05:00Z",
        },
        {
          role: "assistant",
          content:
            "Entendi. Sugiro um tom cordial e objetivo. Quer que eu inclua uma proposta de parcelamento como alternativa?",
          createdAt: "2025-06-17T09:06:00Z",
        },
        {
          role: "user",
          content: "Sim, e mantenha curto.",
          createdAt: "2025-06-17T09:12:00Z",
        },
        {
          role: "assistant",
          content:
            'Segue o rascunho revisado, com um tom mais cordial:\n\n"Olá, [Nome]! Notamos que a fatura de junho ainda está em aberto. Caso prefira, podemos dividir o valor em até 3x. Fico à disposição para ajudar. Abraço!"',
          createdAt: "2025-06-17T09:15:00Z",
        },
      ],
    },
    {
      title: "Resumo da reunião",
      lastMessage:
        "Os principais pontos foram alinhados e organizados em tópicos.",
      lastMessageAt: "2025-06-15T16:45:00Z",
      messages: [
        {
          role: "user",
          content:
            "Resuma os pontos principais da reunião de hoje sobre o lançamento.",
          createdAt: "2025-06-15T16:40:00Z",
        },
        {
          role: "assistant",
          content:
            "Os principais pontos foram:\n\n- Data de lançamento confirmada para 01/07.\n- Responsável pelo material de marketing definido.\n- Pendência: aprovar o orçamento de mídia paga.",
          createdAt: "2025-06-15T16:45:00Z",
        },
      ],
    },
    {
      title: "Roteiro de vendas",
      lastMessage:
        "Para abordagem inicial, sugiro começar pela dor do cliente.",
      lastMessageAt: "2025-06-14T11:00:00Z",
      messages: [
        {
          role: "user",
          content:
            "Me ajude a montar um roteiro de vendas para abordagem por telefone.",
          createdAt: "2025-06-14T10:55:00Z",
        },
        {
          role: "assistant",
          content:
            "Para abordagem inicial, sugiro começar pela dor do cliente: apresente-se rapidamente, faça uma pergunta de diagnóstico e só depois apresente a solução.",
          createdAt: "2025-06-14T11:00:00Z",
        },
      ],
    },
  ];

  for (const conv of conversations) {
    await prisma.conversation.create({
      data: {
        agentId: agent.id,
        channel: "personalUse",
        title: conv.title,
        lastMessage: conv.lastMessage,
        lastMessageAt: new Date(conv.lastMessageAt),
        messageCount: conv.messages.length,
        messages: {
          create: conv.messages.map((m) => ({
            role: m.role,
            content: m.content,
            createdAt: new Date(m.createdAt),
          })),
        },
      },
    });
  }

  console.log("Seed: feed de atividades...");
  await prisma.activity.createMany({
    data: [
      {
        userId: user.id,
        type: "knowledge",
        description: 'Arquivo "Tabela de preços.xlsx" adicionado à base',
        createdAt: new Date("2025-06-18T16:10:00Z"),
      },
      {
        userId: user.id,
        type: "chat",
        description: "Nova conversa iniciada no chat",
        createdAt: new Date("2025-06-18T14:30:00Z"),
      },
      {
        userId: user.id,
        type: "personality",
        description: "Personalidade do assistente atualizada",
        createdAt: new Date("2025-06-17T11:20:00Z"),
      },
      {
        userId: user.id,
        type: "whatsapp",
        description: "WhatsApp conectado com sucesso",
        createdAt: new Date("2025-06-18T10:00:00Z"),
      },
      {
        userId: user.id,
        type: "config",
        description: "Uso pessoal ativado",
        createdAt: new Date("2025-06-17T08:00:00Z"),
      },
      {
        userId: user.id,
        type: "whatsapp",
        description: "32 mensagens respondidas no WhatsApp",
        createdAt: new Date("2025-06-16T18:20:00Z"),
      },
    ],
  });

  console.log("Seed concluido. Login demo: demo@flowassist.com / demo1234");
}

main()
  .catch((err) => {
    console.error("Erro no seed:", err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
