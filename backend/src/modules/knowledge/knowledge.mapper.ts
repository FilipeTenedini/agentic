import type { KnowledgeFile } from "@prisma/client";
import type { AllowedKnowledgeFileType } from "./knowledge.constants.js";

export type KnowledgeFileType = AllowedKnowledgeFileType;

/** Espelha o tipo `KnowledgeFile` do frontend. */
export interface KnowledgeFileDTO {
  id: string;
  name: string;
  type: KnowledgeFileType;
  sizeBytes: number;
  status: string;
  progress?: number;
  errorMessage?: string;
  uploadedAt: string;
  chunks?: number;
  vectors?: number;
  indexedAt?: string;
}

export function toKnowledgeFileDTO(file: KnowledgeFile): KnowledgeFileDTO {
  return {
    id: file.id,
    name: file.name,
    type: file.type as KnowledgeFileType,
    sizeBytes: file.sizeBytes,
    status: file.status,
    progress: file.progress ?? undefined,
    errorMessage: file.errorMessage ?? undefined,
    uploadedAt: file.uploadedAt.toISOString(),
    chunks: file.chunks ?? undefined,
    vectors: file.vectors ?? undefined,
    indexedAt: file.indexedAt?.toISOString(),
  };
}
