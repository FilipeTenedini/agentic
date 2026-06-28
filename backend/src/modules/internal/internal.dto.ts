import { z } from "zod";

/** Proxy N8N → Ollama. Aceita `input` (preferido), `text` (WF embed-message) ou `prompt` (legado). */
export const embedProxySchema = z
  .object({
    model: z.string().optional(),
    input: z.string().min(1).optional(),
    text: z.string().min(1).optional(),
    prompt: z.string().min(1).optional(),
  })
  .refine((data) => data.input ?? data.text ?? data.prompt, {
    message: "Informe input, text ou prompt",
    path: ["input"],
  });

export type EmbedProxyInput = z.infer<typeof embedProxySchema>;

export function resolveEmbedText(input: EmbedProxyInput): string {
  return (input.input ?? input.text ?? input.prompt)!;
}
