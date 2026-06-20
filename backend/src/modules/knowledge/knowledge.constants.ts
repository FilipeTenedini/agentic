export const ALLOWED_KNOWLEDGE_FILE_TYPES = ["csv", "xlsx"] as const;

export type AllowedKnowledgeFileType =
  (typeof ALLOWED_KNOWLEDGE_FILE_TYPES)[number];

export const ALLOWED_KNOWLEDGE_EXTENSIONS = [".csv", ".xls", ".xlsx"] as const;

const EXTENSION_TO_TYPE: Record<string, AllowedKnowledgeFileType> = {
  csv: "csv",
  xls: "xlsx",
  xlsx: "xlsx",
};

export function getFileTypeFromName(name: string): AllowedKnowledgeFileType | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_TYPE[ext] ?? null;
}

export function isAllowedKnowledgeFileName(name: string): boolean {
  return getFileTypeFromName(name) !== null;
}

export const ALLOWED_KNOWLEDGE_FILE_MESSAGE =
  "Apenas arquivos CSV e XLSX sao aceitos na base de conhecimento.";
