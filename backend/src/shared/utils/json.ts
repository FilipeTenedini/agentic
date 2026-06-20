import type { Prisma } from "@prisma/client";

/**
 * Converte um objeto tipado (ex.: AgentPersonality) para o tipo de entrada JSON
 * do Prisma. Necessario porque interfaces sem index signature nao sao
 * diretamente atribuiveis a Prisma.InputJsonValue.
 */
export function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
