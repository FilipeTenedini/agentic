import type { KnowledgeFile, KnowledgeFileType } from "@/types";

/**
 * Arquivos mockados da Base de Conhecimento, cobrindo os 4 estados possíveis
 * (ready, processing, uploading, error). Nada é realmente processado.
 */
export const MOCK_KNOWLEDGE_FILES: KnowledgeFile[] = [
  {
    id: "kf-001",
    name: "Catálogo de produtos 2025.pdf",
    type: "pdf",
    sizeBytes: 2_412_544,
    status: "ready",
    uploadedAt: "2025-06-15T09:30:00Z",
    chunks: 128,
    vectors: 128,
    indexedAt: "2025-06-15T09:32:00Z",
  },
  {
    id: "kf-002",
    name: "Política de trocas e devoluções.docx",
    type: "docx",
    sizeBytes: 184_320,
    status: "ready",
    uploadedAt: "2025-06-15T09:31:00Z",
    chunks: 22,
    vectors: 22,
    indexedAt: "2025-06-15T09:33:00Z",
  },
  {
    id: "kf-003",
    name: "Perguntas frequentes.txt",
    type: "txt",
    sizeBytes: 24_576,
    status: "ready",
    uploadedAt: "2025-06-16T14:10:00Z",
    chunks: 9,
    vectors: 9,
    indexedAt: "2025-06-16T14:11:00Z",
  },
  {
    id: "kf-004",
    name: "Tabela de preços.xlsx",
    type: "xlsx",
    sizeBytes: 96_000,
    status: "processing",
    progress: 62,
    uploadedAt: "2025-06-18T16:00:00Z",
  },
  {
    id: "kf-005",
    name: "Base de clientes (export).csv",
    type: "csv",
    sizeBytes: 512_000,
    status: "error",
    errorMessage: "Não foi possível ler o arquivo. Verifique o formato e tente novamente.",
    uploadedAt: "2025-06-18T16:05:00Z",
  },
];

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

/** Extensões aceitas pelo input de upload (apenas visual/mock). */
export const ACCEPTED_FILE_EXTENSIONS =
  ".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.png,.jpg,.jpeg,.webp";

export const KNOWLEDGE_FILE_TYPE_LABELS: Record<KnowledgeFileType, string> = {
  pdf: "PDF",
  docx: "Documento",
  txt: "Texto",
  csv: "CSV",
  xlsx: "Planilha",
  image: "Imagem",
  other: "Arquivo",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
