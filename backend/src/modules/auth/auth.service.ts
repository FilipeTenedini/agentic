import { prisma } from "../../infra/prisma.js";
import { BadRequest, Conflict, NotFound, Unauthorized } from "../../infra/http/errors.js";
import { hashPassword, verifyPassword } from "../../shared/utils/password.js";
import { signToken } from "../../shared/utils/jwt.js";
import { DEFAULT_PERSONALITY } from "../../shared/domain/personality.js";
import { asJson } from "../../shared/utils/json.js";
import { PLAN_CATALOG } from "../subscriptions/plans.catalog.js";
import { toUserDTO, type UserDTO } from "./auth.mapper.js";
import type { LoginInput, RegisterInput, UpdateProfileInput } from "./auth.dto.js";

interface AuthResult {
  token: string;
  user: UserDTO;
}

function buildAvatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=7c3aed`;
}

/**
 * Cria a conta e ja provisiona o agente (com os 2 canais), a conexao WhatsApp
 * e a assinatura free. Tudo numa transacao para garantir consistencia.
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Conflict("Ja existe uma conta com este email");

  const passwordHash = await hashPassword(input.password);
  const free = PLAN_CATALOG.free;

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        name: input.name.trim(),
        passwordHash,
        avatarUrl: buildAvatarUrl(input.name.trim()),
        subscription: {
          create: {
            plan: "free",
            status: "active",
            renewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            whatsappMsgsMax: free.limits.whatsappMessages,
            chatMsgsMax: free.limits.chatMessages,
            conversationsMax: free.limits.conversations,
          },
        },
        agent: {
          create: {
            name: "Meu Assistente",
            status: "draft",
            description: "",
            baseInstructions: "",
            basePersonality: asJson(DEFAULT_PERSONALITY),
            channels: {
              create: [
                {
                  channelId: "whatsapp",
                  enabled: false,
                  useSharedPersonality: false,
                  useSharedKnowledgeBase: true,
                  instructions: "",
                  personality: asJson(DEFAULT_PERSONALITY),
                },
                {
                  channelId: "personalUse",
                  enabled: false,
                  useSharedPersonality: false,
                  useSharedKnowledgeBase: true,
                  instructions: "",
                  personality: asJson(DEFAULT_PERSONALITY),
                },
              ],
            },
            whatsappConnection: {
              create: { connectionStatus: "disconnected" },
            },
          },
        },
      },
    });
    return created;
  });

  return {
    token: signToken({ userId: user.id, email: user.email }),
    user: toUserDTO(user),
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Unauthorized("Email ou senha invalidos");

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw Unauthorized("Email ou senha invalidos");

  return {
    token: signToken({ userId: user.id, email: user.email }),
    user: toUserDTO(user),
  };
}

export async function getMe(userId: string): Promise<UserDTO> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw NotFound("Usuario nao encontrado");
  return toUserDTO(user);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserDTO> {
  if (input.name === undefined && input.avatarUrl === undefined) {
    throw BadRequest("Nada para atualizar");
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
  });
  return toUserDTO(user);
}
