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
  /** Unico secret bidirecional: backend↔N8N (header x-webhook-secret). */
  N8N_WEBHOOK_SECRET: z.string().default("dev-webhook-secret"),

  OPENAI_API_KEY: z.string().default(""),

  EVOLUTION_API_URL: z.string().default("http://localhost:8080"),
  EVOLUTION_API_KEY: z.string().default(""),

  AWS_REGION: z.string().min(1, "AWS_REGION e obrigatorio"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID e obrigatorio"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY e obrigatorio"),
  AWS_S3_BUCKET: z.string().min(1, "AWS_S3_BUCKET e obrigatorio"),
  AWS_S3_ENDPOINT: z.string().optional(),
  AWS_S3_FORCE_PATH_STYLE: booleanFromString.default("false"),
  S3_SIGNED_URL_EXPIRES_SECONDS: z.coerce.number().default(3600),

  MAX_UPLOAD_BYTES: z.coerce.number().default(20 * 1024 * 1024),

  /** Modelo/dimensao esperados (validacao + payload para WF 07 e embed-message). */
  EMBEDDING_MODEL: z.string().default("nomic-embed-text"),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(768),
  /** Score minimo (cosine) para considerar um hit na busca vetorial. */
  VECTOR_SEARCH_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.5),

  /** Ollama local (Docker). O N8N Cloud chama via proxy POST /api/internal/embed. */
  OLLAMA_URL: z.string().default("http://localhost:11434"),
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
