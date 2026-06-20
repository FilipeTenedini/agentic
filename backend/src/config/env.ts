import "dotenv/config";
import { z } from "zod";

/**
 * Validacao centralizada das variaveis de ambiente. Falha cedo (no boot) se
 * algo obrigatorio estiver faltando, evitando erros obscuros em runtime.
 */
const booleanFromString = z
  .string()
  .transform((value) => value.toLowerCase() === "true")
  .pipe(z.boolean());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL e obrigatorio"),

  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET deve ter ao menos 16 caracteres"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  MOCK_AI: booleanFromString.default("true"),
  MOCK_RAG: booleanFromString.default("true"),
  MOCK_WHATSAPP: booleanFromString.default("true"),

  N8N_URL: z.string().default("http://localhost:5678"),
  N8N_WEBHOOK_SECRET: z.string().default(""),

  OPENAI_API_KEY: z.string().default(""),

  EVOLUTION_API_URL: z.string().default("http://localhost:8080"),
  EVOLUTION_API_KEY: z.string().default(""),

  WEBHOOK_SECRET: z.string().default("dev-webhook-secret"),

  STORAGE_DRIVER: z.enum(["local", "s3", "supabase"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("uploads"),
  MAX_UPLOAD_BYTES: z.coerce.number().default(20 * 1024 * 1024),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variaveis de ambiente invalidas:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

/** Lista de origens permitidas pelo CORS (suporta multiplas separadas por virgula). */
export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const isProduction = env.NODE_ENV === "production";
