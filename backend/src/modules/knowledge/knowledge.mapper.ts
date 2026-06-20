import type { KnowledgeFile } from "@prisma/client";

export type KnowledgeFileType =
  | "pdf"
  | "docx"
  | "txt"
  | "csv"
  | "xlsx"
  | "image"
  | "other";

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

const EXTENSION_TO_TYPE: Record<string, KnowledgeFileType> = {
  pdf: "pdf",
  doc: "docx",
  docx: "docx",
  txt: "txt",
  csv: "csv",
  xls: "xlsx",
  xlsx: "xlsx",
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  gif: "image",
};

export function getFileTypeFromName(name: string): KnowledgeFileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_TYPE[ext] ?? "other";
}
