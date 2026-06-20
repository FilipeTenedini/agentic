import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().min(1, "query obrigatoria"),
  topK: z.coerce.number().int().min(1).max(20).default(5),
});

/** Callback do N8N para atualizar o status de um arquivo (RAG). */
export const fileStatusSchema = z.object({
  status: z.enum(["uploading", "processing", "ready", "error"]),
  progress: z.number().min(0).max(100).optional(),
  errorMessage: z.string().optional(),
  chunks: z.number().int().optional(),
  vectors: z.number().int().optional(),
  indexedAt: z.string().optional(),
});

/** Callback do N8N para salvar chunks + embeddings (RAG). */
export const chunksSchema = z.object({
  chunks: z
    .array(
      z.object({
        content: z.string(),
        chunkIndex: z.number().int(),
        embedding: z.array(z.number()).optional(),
      })
    )
    .min(1),
});

export type SearchInput = z.infer<typeof searchSchema>;
export type FileStatusInput = z.infer<typeof fileStatusSchema>;
export type ChunksInput = z.infer<typeof chunksSchema>;
