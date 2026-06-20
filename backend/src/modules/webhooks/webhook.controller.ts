import type { Request, Response } from "express";
import { updateConnectionByInstance } from "../agents/whatsapp.service.js";
import type {
  ConnectionStatusInput,
  EvolutionEventInput,
} from "./webhook.dto.js";

/**
 * Callback do N8N (Workflow de eventos de conexao WhatsApp). Recebe um status
 * ja normalizado e atualiza a conexao do agente correspondente.
 */
export async function whatsappStatus(req: Request, res: Response) {
  const input = req.body as ConnectionStatusInput;
  const result = await updateConnectionByInstance(input.instanceName, {
    connectionStatus: input.connectionStatus,
    phoneNumber: input.phoneNumber,
    connectedAt: input.connectedAt,
    qrCode: input.qrCode,
  });
  res.json(result);
}

/**
 * Webhook bruto da Evolution API. Traduz o tipo de evento em um status interno.
 * Em producao, o N8N costuma fazer essa traducao e chamar /whatsapp-status.
 */
export async function evolutionEvent(req: Request, res: Response) {
  const body = req.body as EvolutionEventInput;
  const instanceName = body.instance ?? body.instanceName;
  if (!instanceName) {
    res.json({ ok: true, ignored: "sem instancia" });
    return;
  }

  const status = mapEvolutionEvent(body.event);
  if (!status) {
    res.json({ ok: true, ignored: body.event });
    return;
  }

  const data = body.data ?? {};
  await updateConnectionByInstance(instanceName, {
    connectionStatus: status,
    phoneNumber: typeof data.phoneNumber === "string" ? data.phoneNumber : undefined,
    qrCode: typeof data.qrCode === "string" ? data.qrCode : undefined,
    connectedAt: status === "connected" ? new Date().toISOString() : undefined,
  });
  res.json({ ok: true, status });
}

function mapEvolutionEvent(
  event: string
): "disconnected" | "connecting" | "connected" | "reconnecting" | null {
  const e = event.toLowerCase();
  if (e.includes("qr")) return "connecting";
  if (e.includes("open") || e.includes("connected")) return "connected";
  if (e.includes("close") || e.includes("disconnected")) return "disconnected";
  return null;
}
