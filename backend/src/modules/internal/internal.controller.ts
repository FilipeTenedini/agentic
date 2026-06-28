import type { Request, Response } from "express";
import { createEmbedding } from "../../infra/integrations/ollama.client.js";
import type { EmbedProxyInput } from "./internal.dto.js";
import { resolveEmbedText } from "./internal.dto.js";
import { logger } from "../../shared/utils/logger.js";

const log = logger.child("embed-proxy");

/** Repassa embedding ao Ollama local — exposto via API_URL/ngrok ao N8N Cloud. */
export async function proxyEmbed(req: Request, res: Response) {
  const input = req.body as EmbedProxyInput;
  const text = resolveEmbedText(input);

  log.info("Proxy embed recebido do N8N", {
    model: input.model ?? "default",
    textLength: text.length,
  });

  const result = await createEmbedding(text, input.model);
  res.json(result);
}
