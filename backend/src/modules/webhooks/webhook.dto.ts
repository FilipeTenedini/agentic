import { z } from "zod";

/** Status de conexao enviado pelo N8N (Workflow de eventos de conexao). */
export const connectionStatusSchema = z.object({
  instanceName: z.string().min(1),
  connectionStatus: z.enum([
    "disconnected",
    "connecting",
    "connected",
    "reconnecting",
  ]),
  phoneNumber: z.string().optional(),
  connectedAt: z.string().optional(),
  qrCode: z.string().optional(),
});

/**
 * Evento bruto da Evolution API. Campos variam conforme o tipo de evento;
 * por isso e bem permissivo. O service traduz para um status interno.
 */
export const evolutionEventSchema = z.object({
  event: z.string(),
  instance: z.string().optional(),
  instanceName: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export type ConnectionStatusInput = z.infer<typeof connectionStatusSchema>;
export type EvolutionEventInput = z.infer<typeof evolutionEventSchema>;
