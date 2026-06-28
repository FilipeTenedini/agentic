-- Alinha dimensao do vetor com Ollama nomic-embed-text (768).
-- Chunks indexados antes desta migration perdem embedding (reprocesse os arquivos).
UPDATE "knowledge_chunks" SET "embedding" = NULL WHERE "embedding" IS NOT NULL;

ALTER TABLE "knowledge_chunks"
  ALTER COLUMN "embedding" TYPE vector(768);

CREATE INDEX IF NOT EXISTS "knowledge_chunks_embedding_hnsw_idx"
  ON "knowledge_chunks"
  USING hnsw ("embedding" vector_cosine_ops)
  WHERE "embedding" IS NOT NULL;
