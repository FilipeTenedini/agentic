import { env } from "../../config/env.js";
import { callN8nWebhook } from "./n8n.client.js";

const EMBED_WEBHOOK_PATH = "embed-message";

/**
 * Gera embedding de um texto via workflow N8N (webhook embed-message).
 * O N8N chama Ollama (ou outro provider); deve usar o mesmo modelo do WF 07.
 */
export async function embedText(text: string): Promise<number[]> {
  const result = await callN8nWebhook<{ embedding?: number[] }>({
    path: EMBED_WEBHOOK_PATH,
    payload: {
      text,
      model: env.EMBEDDING_MODEL,
      dimensions: env.EMBEDDING_DIMENSIONS,
    },
  });

  if (!result.embedding?.length) {
    throw new Error(
      `N8N (${EMBED_WEBHOOK_PATH}) respondeu sem o campo embedding`
    );
  }

  if (result.embedding.length !== env.EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding com ${result.embedding.length} dims; esperado ${env.EMBEDDING_DIMENSIONS}. ` +
        "Ajuste EMBEDDING_MODEL/EMBEDDING_DIMENSIONS no backend e no N8N."
    );
  }

  return result.embedding;
}

export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
