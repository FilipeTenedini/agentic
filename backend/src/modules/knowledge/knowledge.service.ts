import { prisma } from "../../infra/prisma.js";
import { env } from "../../config/env.js";
import { NotFound, BadRequest } from "../../infra/http/errors.js";
import { saveFile, deleteFile, getSignedDownloadUrl } from "../../infra/integrations/storage.js";
import { triggerN8nWebhook } from "../../infra/integrations/n8n.client.js";
import {
  embedText,
  toVectorLiteral,
} from "../../infra/integrations/embedding.client.js";
import { logActivity } from "../activities/activity.service.js";
import { getAgentId } from "../agents/agent.service.js";
import {
  ALLOWED_KNOWLEDGE_FILE_MESSAGE,
  getFileTypeFromName,
} from "./knowledge.constants.js";
import {
  toKnowledgeFileDTO,
  type KnowledgeFileDTO,
} from "./knowledge.mapper.js";
import type { ChunksInput, FileStatusInput } from "./knowledge.dto.js";
import { logger } from "../../shared/utils/logger.js";

const log = logger.child("knowledge");

export async function listFiles(userId: string): Promise<KnowledgeFileDTO[]> {
  const agentId = await getAgentId(userId);
  const files = await prisma.knowledgeFile.findMany({
    where: { agentId },
    orderBy: { uploadedAt: "desc" },
  });
  return files.map(toKnowledgeFileDTO);
}

export async function getFile(
  userId: string,
  fileId: string
): Promise<KnowledgeFileDTO> {
  const agentId = await getAgentId(userId);
  const file = await prisma.knowledgeFile.findFirst({
    where: { id: fileId, agentId },
  });
  if (!file) throw NotFound("Arquivo nao encontrado");
  return toKnowledgeFileDTO(file);
}

export async function addFile(
  userId: string,
  upload: { originalname: string; size: number; buffer: Buffer }
): Promise<KnowledgeFileDTO> {
  const agentId = await getAgentId(userId);
  const fileType = getFileTypeFromName(upload.originalname);
  if (!fileType) throw BadRequest(ALLOWED_KNOWLEDGE_FILE_MESSAGE);

  const stored = await saveFile(userId, upload.originalname, upload.buffer);

  const file = await prisma.knowledgeFile.create({
    data: {
      agentId,
      name: upload.originalname,
      type: fileType,
      sizeBytes: upload.size,
      status: "uploading",
      progress: 0,
      storageUrl: stored.storageUrl,
    },
  });

  await logActivity(
    userId,
    "knowledge",
    `Arquivo "${upload.originalname}" adicionado à base`
  );

  startProcessing(file.id, agentId, stored.storageUrl, file.type);
  log.info("Arquivo adicionado e processamento iniciado", {
    fileId: file.id,
    name: upload.originalname,
    mockRag: env.MOCK_RAG,
  });
  return toKnowledgeFileDTO(file);
}

export async function removeFile(userId: string, fileId: string): Promise<void> {
  const agentId = await getAgentId(userId);
  const file = await prisma.knowledgeFile.findFirst({
    where: { id: fileId, agentId },
  });
  if (!file) throw NotFound("Arquivo nao encontrado");
  await deleteFile(file.storageUrl);
  await prisma.knowledgeFile.delete({ where: { id: file.id } });
}

export async function retryFile(
  userId: string,
  fileId: string
): Promise<KnowledgeFileDTO> {
  const agentId = await getAgentId(userId);
  const file = await prisma.knowledgeFile.findFirst({
    where: { id: fileId, agentId },
  });
  if (!file) throw NotFound("Arquivo nao encontrado");

  const updated = await prisma.knowledgeFile.update({
    where: { id: file.id },
    data: { status: "uploading", progress: 0, errorMessage: null },
  });

  startProcessing(file.id, agentId, file.storageUrl, file.type);
  return toKnowledgeFileDTO(updated);
}

/**
 * Inicia o processamento do arquivo.
 * - MOCK_RAG=true  -> simula uploading -> processing -> ready|error com timers.
 * - MOCK_RAG=false -> dispara o workflow "knowledge-file-processing" do N8N,
 *   que faz extracao + chunking + embeddings e chama os callbacks deste modulo.
 */
function startProcessing(
  fileId: string,
  agentId: string,
  storageUrl: string | null,
  fileType: string
) {
  if (!env.MOCK_RAG) {
    void (async () => {
      const downloadUrl = storageUrl
        ? await getSignedDownloadUrl(storageUrl).catch((err) => {
            log.error("Falha ao gerar URL de download", {
              fileId,
              error: err instanceof Error ? err.message : String(err),
            });
            return null;
          })
        : null;

      log.info("Disparando workflow knowledge-file-processing", { fileId, agentId });
      triggerN8nWebhook({
        path: "knowledge-file-processing",
        payload: {
          fileId,
          agentId,
          storageUrl,
          downloadUrl,
          fileType,
          embeddingModel: env.EMBEDDING_MODEL,
          embeddingDimensions: env.EMBEDDING_DIMENSIONS,
        },
      });
    })();
    return;
  }
  simulateProcessing(fileId);
}

/** Retoma arquivos presos em uploading/processing apos restart do servidor (mock). */
export async function resumeStuckMockProcessing(): Promise<number> {
  if (!env.MOCK_RAG) return 0;
  const stuck = await prisma.knowledgeFile.findMany({
    where: { status: { in: ["uploading", "processing"] } },
    select: { id: true },
  });
  for (const { id } of stuck) {
    simulateProcessing(id);
  }
  return stuck.length;
}

/** Simulacao do pipeline de RAG (espelha o frontend knowledge-base-context). */
function simulateProcessing(fileId: string) {
  let uploadProgress = 0;
  const uploadStep = setInterval(() => {
    uploadProgress += 25;
    if (uploadProgress < 100) {
      void patch(fileId, { progress: uploadProgress });
      return;
    }
    clearInterval(uploadStep);
    void patch(fileId, { status: "processing", progress: 0 });

    let procProgress = 0;
    const procStep = setInterval(() => {
      procProgress += 20;
      if (procProgress < 100) {
        void patch(fileId, { progress: procProgress });
        return;
      }
      clearInterval(procStep);
      const failed = Math.random() < 0.15;
      if (failed) {
        void patch(fileId, {
          status: "error",
          progress: null,
          errorMessage: "Falha ao processar o arquivo. Tente enviar novamente.",
        });
      } else {
        const chunks = 8 + Math.floor(Math.random() * 120);
        void patch(fileId, {
          status: "ready",
          progress: null,
          chunks,
          vectors: chunks,
          indexedAt: new Date(),
        });
      }
    }, 400);
  }, 250);
}

async function patch(
  fileId: string,
  data: {
    status?: string;
    progress?: number | null;
    errorMessage?: string | null;
    chunks?: number;
    vectors?: number;
    indexedAt?: Date;
  }
) {
  try {
    await prisma.knowledgeFile.update({ where: { id: fileId }, data });
  } catch {
    // Arquivo pode ter sido removido durante a simulacao: ignora.
  }
}

// ---------------------------------------------------------------------------
// Busca semantica (consumida pelo N8N) e callbacks de processamento
// ---------------------------------------------------------------------------

export interface SearchHit {
  content: string;
  score: number;
  fileId: string;
  chunkIndex: number;
}

const SEARCH_STOPWORDS = new Set([
  "a",
  "o",
  "e",
  "de",
  "da",
  "do",
  "em",
  "um",
  "uma",
  "uns",
  "umas",
  "os",
  "as",
  "que",
  "por",
  "para",
  "com",
  "se",
  "na",
  "no",
  "nas",
  "nos",
  "sobre",
  "voce",
  "você",
  "tem",
  "algum",
  "alguma",
  "conhecimento",
  "especifico",
  "específico",
  "isso",
  "essa",
  "esse",
  "aqui",
  "ola",
  "oi",
  "boa",
  "dia",
  "tarde",
  "noite",
]);

/** Extrai termos buscaveis da pergunta (evita ILIKE na frase inteira). */
function extractSearchTerms(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  const words = normalized.split(/[^a-z0-9]+/i).filter(Boolean);
  const terms = words.filter(
    (w) => w.length >= 3 && !SEARCH_STOPWORDS.has(w)
  );

  return [...new Set(terms)];
}

/**
 * Busca trechos relevantes: pgvector quando ha embeddings indexados;
 * fallback para busca por palavras-chave (ILIKE).
 */
export async function searchByAgent(
  agentId: string,
  query: string,
  topK: number
): Promise<SearchHit[]> {
  const hasVectors = await agentHasEmbeddings(agentId);
  if (hasVectors && !env.MOCK_RAG) {
    try {
      const vectorHits = await searchByAgentVector(agentId, query, topK);
      if (vectorHits.length > 0) {
        log.info("Busca vetorial retornou hits", {
          agentId,
          hits: vectorHits.length,
          topScore: Number(vectorHits[0]?.score.toFixed(3)),
        });
        return vectorHits;
      }
      log.info("Busca vetorial sem hits acima do score minimo; tentando keywords", {
        agentId,
        minScore: env.VECTOR_SEARCH_MIN_SCORE,
      });
    } catch (err) {
      log.warn("Busca vetorial falhou; usando fallback textual", {
        agentId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const keywordHits = await searchByAgentKeywords(agentId, query, topK);
  log.info("Busca por palavras-chave", {
    agentId,
    hits: keywordHits.length,
    hasVectors,
    mockRag: env.MOCK_RAG,
  });
  return keywordHits;
}

async function agentHasEmbeddings(agentId: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<[{ count: number }]>(
    `SELECT COUNT(*)::int AS count FROM knowledge_chunks
     WHERE agent_id = $1 AND embedding IS NOT NULL`,
    agentId
  );
  return (rows[0]?.count ?? 0) > 0;
}

async function searchByAgentVector(
  agentId: string,
  query: string,
  topK: number
): Promise<SearchHit[]> {
  const queryEmbedding = await embedText(query);
  const vectorLiteral = toVectorLiteral(queryEmbedding);

  const rows = await prisma.$queryRawUnsafe<
    Array<{
      content: string;
      file_id: string;
      chunk_index: number;
      score: number;
    }>
  >(
    `SELECT content, file_id, chunk_index,
            1 - (embedding <=> $1::vector) AS score
     FROM knowledge_chunks
     WHERE agent_id = $2 AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    vectorLiteral,
    agentId,
    topK
  );

  return rows
    .filter((r) => r.score >= env.VECTOR_SEARCH_MIN_SCORE)
    .map((r) => ({
      content: r.content,
      score: r.score,
      fileId: r.file_id,
      chunkIndex: r.chunk_index,
    }));
}

async function searchByAgentKeywords(
  agentId: string,
  query: string,
  topK: number
): Promise<SearchHit[]> {
  const terms = extractSearchTerms(query);
  if (terms.length === 0) return [];

  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      agentId,
      OR: terms.map((term) => ({
        content: { contains: term, mode: "insensitive" as const },
      })),
    },
    take: topK * 4,
  });

  const ranked = chunks
    .map((c) => {
      const lower = c.content.toLowerCase();
      const matched = terms.filter((t) => lower.includes(t)).length;
      return { chunk: c, score: matched / terms.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked.map(({ chunk, score }) => ({
    content: chunk.content,
    score,
    fileId: chunk.fileId,
    chunkIndex: chunk.chunkIndex,
  }));
}

export async function search(
  userId: string,
  query: string,
  topK: number
): Promise<SearchHit[]> {
  const agentId = await getAgentId(userId);
  return searchByAgent(agentId, query, topK);
}

/** Callback do N8N: atualiza o status de um arquivo apos processamento. */
export async function updateFileStatus(
  fileId: string,
  input: FileStatusInput
): Promise<KnowledgeFileDTO> {
  const file = await prisma.knowledgeFile.findUnique({ where: { id: fileId } });
  if (!file) throw NotFound("Arquivo nao encontrado");

  const updated = await prisma.knowledgeFile.update({
    where: { id: fileId },
    data: {
      status: input.status,
      progress: input.progress ?? null,
      errorMessage: input.errorMessage ?? null,
      ...(input.chunks !== undefined ? { chunks: input.chunks } : {}),
      ...(input.vectors !== undefined ? { vectors: input.vectors } : {}),
      ...(input.indexedAt !== undefined
        ? { indexedAt: new Date(input.indexedAt) }
        : {}),
    },
  });

  log.info("Status do arquivo atualizado (callback N8N)", {
    fileId,
    status: input.status,
    progress: input.progress,
    chunks: input.chunks,
    vectors: input.vectors,
  });

  return toKnowledgeFileDTO(updated);
}

/** Callback do N8N: salva os chunks + embeddings gerados para um arquivo. */
export async function saveChunks(
  fileId: string,
  input: ChunksInput
): Promise<{ saved: number; vectors: number }> {
  const file = await prisma.knowledgeFile.findUnique({ where: { id: fileId } });
  if (!file) throw NotFound("Arquivo nao encontrado");

  const expectedDims = env.EMBEDDING_DIMENSIONS;

  await prisma.knowledgeChunk.deleteMany({ where: { fileId } });

  for (const chunk of input.chunks) {
    if (chunk.embedding && chunk.embedding.length !== expectedDims) {
      throw BadRequest(
        `Chunk ${chunk.chunkIndex}: embedding com ${chunk.embedding.length} dims; esperado ${expectedDims}`
      );
    }

    const created = await prisma.knowledgeChunk.create({
      data: {
        fileId,
        agentId: file.agentId,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
      },
    });

    if (chunk.embedding && chunk.embedding.length > 0) {
      const vectorLiteral = toVectorLiteral(chunk.embedding);
      await prisma.$executeRawUnsafe(
        `UPDATE knowledge_chunks SET embedding = $1::vector WHERE id = $2`,
        vectorLiteral,
        created.id
      );
    }
  }

  const vectors = input.chunks.filter((c) => c.embedding?.length).length;

  log.info("Chunks salvos (callback N8N)", {
    fileId,
    saved: input.chunks.length,
    vectors,
  });

  return { saved: input.chunks.length, vectors };
}
