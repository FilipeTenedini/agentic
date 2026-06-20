import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { Unauthorized } from "../../infra/http/errors.js";

/**
 * Protege rotas chamadas por servicos externos (N8N, Evolution API).
 * Espera o header `x-webhook-secret` igual a WEBHOOK_SECRET do .env.
 */
export function requireWebhookSecret(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const secret = req.header("x-webhook-secret");
  if (!secret || secret !== env.WEBHOOK_SECRET) {
    throw Unauthorized("Webhook secret invalido");
  }
  next();
}
