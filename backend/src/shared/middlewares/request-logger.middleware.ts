import type { NextFunction, Request, Response } from "express";
import { isProduction } from "../../config/env.js";
import { logger } from "../utils/logger.js";

const log = logger.child("http");

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "secret",
  "refreshtoken",
  "accesstoken",
]);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        SENSITIVE_KEYS.has(key.toLowerCase()) ? "[redacted]" : redact(nested),
      ])
    );
  }
  return value;
}

function formatBody(req: Request): string | undefined {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  if (!req.body || typeof req.body !== "object") return undefined;
  if (Object.keys(req.body).length === 0) return undefined;
  try {
    return JSON.stringify(redact(req.body));
  } catch {
    return "[body nao serializavel]";
  }
}

/** Loga cada request HTTP com metodo, rota, status e tempo de resposta. */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const status = res.statusCode;
    const level = status >= 500 ? "ERR" : status >= 400 ? "WARN" : "OK";
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${level} ${method} ${originalUrl} -> ${status} (${duration}ms)`;

    if (!isProduction) {
      const body = formatBody(req);
      if (body) {
        log.raw("info", `${line} body=${body}`);
        return;
      }
    }

    if (level === "ERR") log.raw("error", line);
    else if (level === "WARN") log.raw("warn", line);
    else log.raw("info", line);
  });

  next();
}
