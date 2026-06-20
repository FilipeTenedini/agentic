import { env } from "../../config/env.js";

/**
 * Cliente da Evolution API (WhatsApp).
 *
 * - MOCK_WHATSAPP=true  -> simula conexao/QR sem servico externo.
 * - MOCK_WHATSAPP=false -> chama a Evolution API real (criar instancia, QR,
 *   enviar mensagem). Ver documentation/BACKEND-INTEGRACAO.md.
 */

const MOCK_PHONE_NUMBER = "+55 11 98765-4321";

export interface ConnectResult {
  instanceName: string;
  qrCode: string | null;
  phoneNumber?: string;
}

export async function createWhatsAppInstance(
  agentId: string
): Promise<ConnectResult> {
  const instanceName = `flowassist-${agentId.slice(0, 8)}`;

  if (env.MOCK_WHATSAPP) {
    return {
      instanceName,
      // QR fake apenas ilustrativo (data URL minima).
      qrCode:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQAY3Y2wAAAAAElFTkSuQmCC",
      phoneNumber: MOCK_PHONE_NUMBER,
    };
  }

  // GANCHO: criar instancia real na Evolution API.
  const response = await fetch(
    `${env.EVOLUTION_API_URL.replace(/\/$/, "")}/instance/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.EVOLUTION_API_KEY,
      },
      body: JSON.stringify({ instanceName, qrcode: true }),
    }
  );
  if (!response.ok) {
    throw new Error(`Evolution API respondeu ${response.status}`);
  }
  const data = (await response.json()) as {
    qrcode?: { base64?: string };
  };
  return { instanceName, qrCode: data.qrcode?.base64 ?? null };
}

export async function deleteWhatsAppInstance(
  instanceName?: string | null
): Promise<void> {
  if (env.MOCK_WHATSAPP || !instanceName) return;

  await fetch(
    `${env.EVOLUTION_API_URL.replace(/\/$/, "")}/instance/delete/${instanceName}`,
    {
      method: "DELETE",
      headers: { apikey: env.EVOLUTION_API_KEY },
    }
  ).catch((err) => console.error("Falha ao remover instancia WhatsApp:", err));
}
