import { env } from "../../config/env.js";
import { logger } from "../../shared/utils/logger.js";

const log = logger.child("n8n");

/**
 * Cliente generico para disparar workflows do N8N via webhook.
 *
 * GANCHO DE INTEGRACAO: quando as flags MOCK_* estao desligadas, os services
 * deste backend chamam estas funcoes. Os contratos de payload/resposta estao
 * documentados em documentation/BACKEND-INTEGRACAO.md.
 */

export interface N8nCallOptions {
  /** Caminho do webhook, ex.: "personal-use-chat". Vira {N8N_URL}/webhook/{path}. */
  path: string;
  payload: unknown;
}

export async function callN8nWebhook<T = unknown>({
  path,
  payload,
}: N8nCallOptions): Promise<T> {
  const url = `${env.N8N_URL}/${path}`;
  const start = Date.now();

  log.info(`Chamando webhook ${path}`, { url });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": env.N8N_WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text().catch(() => "");
  const durationMs = Date.now() - start;

  if (!response.ok) {
    log.error(`Webhook ${path} falhou`, {
      status: response.status,
      durationMs,
      body: text.slice(0, 300),
    });
    throw new Error(`N8N respondeu ${response.status}: ${text}`);
  }

  if (!text.trim()) {
    log.error(`Webhook ${path} retornou body vazio`, { durationMs });
    throw new Error(
      "N8N respondeu com body vazio. Verifique se o workflow esta ativo e se o Respond to Webhook retorna JSON (ex.: { reply } ou { embedding })."
    );
  }

  try {
    const parsed = JSON.parse(text) as T;
    log.info(`Webhook ${path} OK`, { durationMs });
    return parsed;
  } catch {
    log.error(`Webhook ${path} retornou JSON invalido`, {
      durationMs,
      body: text.slice(0, 200),
    });
    throw new Error(`N8N retornou JSON invalido: ${text.slice(0, 200)}`);
  }
}

/** Dispara (fire-and-forget) um workflow assincrono do N8N. */
export function triggerN8nWebhook(options: N8nCallOptions): void {
  log.info(`Disparando webhook assincrono ${options.path}`);
  void callN8nWebhook(options).catch((err) => {
    log.error(`Falha ao disparar workflow ${options.path}`, {
      error: err instanceof Error ? err.message : String(err),
    });
  });
}
