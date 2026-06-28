import { env } from "../../config/env.js";
import { AppError } from "../../infra/http/errors.js";

export interface OllamaEmbedResponse {
  model: string;
  embeddings: number[][];
}

/** POST /api/embed no Ollama local (Docker). */
export async function createEmbedding(
  input: string,
  model = env.EMBEDDING_MODEL
): Promise<OllamaEmbedResponse> {
  const base = env.OLLAMA_URL.replace(/\/$/, "");
  let response: Response;

  try {
    response = await fetch(`${base}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, input }),
    });
  } catch (cause) {
    throw new AppError(
      502,
      `Ollama indisponivel em ${base}. Rode: npm run ollama:setup`,
      String(cause)
    );
  }

  const body = await response.text();
  let parsed: OllamaEmbedResponse;

  try {
    parsed = JSON.parse(body) as OllamaEmbedResponse;
  } catch {
    throw new AppError(
      502,
      "Ollama retornou resposta invalida",
      body.slice(0, 500)
    );
  }

  if (!response.ok) {
    throw new AppError(
      502,
      `Ollama erro ${response.status}`,
      (parsed as unknown as { error?: string }).error ?? body.slice(0, 500)
    );
  }

  const vector = parsed.embeddings?.[0];
  if (!vector?.length) {
    throw new AppError(502, "Ollama retornou embedding vazio");
  }

  if (vector.length !== env.EMBEDDING_DIMENSIONS) {
    throw new AppError(
      502,
      `Embedding com ${vector.length} dims; esperado ${env.EMBEDDING_DIMENSIONS}`
    );
  }

  return parsed;
}
