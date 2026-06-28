import type { Request, Response } from "express";
import { createEmbedding } from "../../infra/integrations/ollama.client.js";
import type { EmbedProxyInput } from "./internal.dto.js";
import { resolveEmbedText } from "./internal.dto.js";

/** Repassa embedding ao Ollama local — exposto via API_URL/ngrok ao N8N Cloud. */
export async function proxyEmbed(req: Request, res: Response) {
  const input = req.body as EmbedProxyInput;
  const text = resolveEmbedText(input);
  const result = await createEmbedding(text, input.model);
  res.json(result);
}
