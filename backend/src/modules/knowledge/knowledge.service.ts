import { prisma } from "../../infra/prisma.js";
import { env } from "../../config/env.js";
import { NotFound, BadRequest } from "../../infra/http/errors.js";
import { saveFile, deleteFile, getSignedDownloadUrl } from "../../infra/integrations/storage.js";
import { triggerN8nWebhook } from "../../infra/integrations/n8n.client.js";
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
            console.error(
              `Falha ao gerar URL de download para ${fileId}:`,
              err
            );
            return null;
          })
        : null;

      triggerN8nWebhook({
        path: "knowledge-file-processing",
        payload: { fileId, agentId, storageUrl, downloadUrl, fileType },
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

/**
 * Busca trechos relevantes na base. No mock faz match textual simples (ILIKE).
 * Em producao, troca para busca vetorial via pgvector (<-> / cosine).
 */
export async function searchByAgent(
  agentId: string,
  query: string,
  topK: number
): Promise<SearchHit[]> {
  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      agentId,
      content: { contains: query, mode: "insensitive" },
    },
    take: topK,
  });

  return chunks.map((c) => ({
    content: c.content,
    score: 1,
    fileId: c.fileId,
    chunkIndex: c.chunkIndex,
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
  return toKnowledgeFileDTO(updated);
}

/** Callback do N8N: salva os chunks + embeddings gerados para um arquivo. */
export async function saveChunks(
  fileId: string,
  input: ChunksInput
): Promise<{ saved: number }> {
  const file = await prisma.knowledgeFile.findUnique({ where: { id: fileId } });
  if (!file) throw NotFound("Arquivo nao encontrado");

  // Embeddings (vector) sao gravados via SQL bruto quando presentes.
  for (const chunk of input.chunks) {
    const created = await prisma.knowledgeChunk.create({
      data: {
        fileId,
        agentId: file.agentId,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
      },
    });
    if (chunk.embedding && chunk.embedding.length > 0) {
      const vectorLiteral = `[${chunk.embedding.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE knowledge_chunks SET embedding = $1::vector WHERE id = $2`,
        vectorLiteral,
        created.id
      );
    }
  }

  return { saved: input.chunks.length };
}
