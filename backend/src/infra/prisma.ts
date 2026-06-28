import { PrismaClient } from "@prisma/client";
import { logger } from "../shared/utils/logger.js";

const log = logger.child("db");

/** Singleton do PrismaClient (evita multiplas conexoes em hot-reload). */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Garante que o banco esta acessivel e que a extensao pgvector existe
 * (necessaria para a coluna vector dos KnowledgeChunk no RAG).
 */
export async function ensureDatabaseReady(): Promise<void> {
  await prisma.$connect();
  try {
    await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;");
  } catch (err) {
    // Em ambientes sem permissao de superuser a extensao pode ja existir ou
    // precisar ser criada manualmente. Nao bloqueia o boot no mock mode.
    log.warn("Nao foi possivel garantir extensao pgvector automaticamente", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
