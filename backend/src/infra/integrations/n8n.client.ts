import { env } from "../../config/env.js";

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
  const url = `${env.N8N_URL.replace(/\/$/, "")}/webhook/${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": env.N8N_WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`N8N respondeu ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

/** Dispara (fire-and-forget) um workflow assincrono do N8N. */
export function triggerN8nWebhook(options: N8nCallOptions): void {
  void callN8nWebhook(options).catch((err) => {
    console.error(`Falha ao disparar workflow N8N (${options.path}):`, err);
  });
}
