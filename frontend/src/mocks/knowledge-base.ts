import type { KnowledgeFile, KnowledgeFileType } from "@/types";

/**
 * Arquivos mockados da Base de Conhecimento (apenas CSV e XLSX).
 */
export const MOCK_KNOWLEDGE_FILES: KnowledgeFile[] = [
  {
    id: "kf-001",
    name: "Tabela de preços.xlsx",
    type: "xlsx",
    sizeBytes: 96_000,
    status: "ready",
    uploadedAt: "2025-06-15T09:30:00Z",
    chunks: 48,
    vectors: 48,
    indexedAt: "2025-06-15T09:32:00Z",
  },
  {
    id: "kf-002",
    name: "Base de clientes (export).csv",
    type: "csv",
    sizeBytes: 512_000,
    status: "ready",
    uploadedAt: "2025-06-16T14:10:00Z",
    chunks: 22,
    vectors: 22,
    indexedAt: "2025-06-16T14:11:00Z",
  },
  {
    id: "kf-003",
    name: "Estoque atual.xlsx",
    type: "xlsx",
    sizeBytes: 184_320,
    status: "processing",
    progress: 62,
    uploadedAt: "2025-06-18T16:00:00Z",
  },
  {
    id: "kf-004",
    name: "Vendas junho.csv",
    type: "csv",
    sizeBytes: 24_576,
    status: "error",
    errorMessage:
      "Não foi possível ler o arquivo. Verifique o formato e tente novamente.",
    uploadedAt: "2025-06-18T16:05:00Z",
  },
];

const EXTENSION_TO_TYPE: Record<string, KnowledgeFileType> = {
  csv: "csv",
  xls: "xlsx",
  xlsx: "xlsx",
};

export function getFileTypeFromName(name: string): KnowledgeFileType | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_TYPE[ext] ?? null;
}

export function isAllowedKnowledgeFileName(name: string): boolean {
  return getFileTypeFromName(name) !== null;
}

export const ACCEPTED_FILE_EXTENSIONS = ".csv,.xls,.xlsx";

export const ALLOWED_KNOWLEDGE_FILE_MESSAGE =
  "Apenas arquivos CSV e XLSX são aceitos na base de conhecimento.";

export const KNOWLEDGE_FILE_TYPE_LABELS: Record<KnowledgeFileType, string> = {
  csv: "CSV",
  xlsx: "Planilha",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
