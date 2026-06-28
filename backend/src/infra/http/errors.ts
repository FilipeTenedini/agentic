import type { NextFunction, Request, Response } from "express";
import type { MulterError } from "multer";
import { ZodError } from "zod";
import { isProduction } from "../../config/env.js";
import { ALLOWED_KNOWLEDGE_FILE_MESSAGE } from "../../modules/knowledge/knowledge.constants.js";
import { logger } from "../../shared/utils/logger.js";

const log = logger.child("http");

/**
 * Erro de aplicacao com status HTTP. Use para erros esperados/de negocio
 * (404, 401, 409, etc.) em vez de lancar Error generico.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const NotFound = (message = "Recurso nao encontrado") =>
  new AppError(404, message);
export const Unauthorized = (message = "Nao autorizado") =>
  new AppError(401, message);
export const Forbidden = (message = "Acesso negado") =>
  new AppError(403, message);
export const BadRequest = (message = "Requisicao invalida", details?: unknown) =>
  new AppError(400, message, details);
export const Conflict = (message = "Conflito") => new AppError(409, message);

/** Handler global de erros. Registrar por ultimo, depois de todas as rotas. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados invalidos",
      details: err.flatten().fieldErrors,
    });
  }

  const multerErr = err as MulterError;
  if (multerErr?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "Arquivo excede o tamanho maximo permitido.",
    });
  }

  if (err instanceof Error && err.message === ALLOWED_KNOWLEDGE_FILE_MESSAGE) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof AppError) {
    if (!isProduction && err.statusCode >= 400) {
      log.warn(`${_req.method} ${_req.originalUrl} -> ${err.statusCode}`, {
        message: err.message,
      });
    }
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  log.error(`${_req.method} ${_req.originalUrl} -> erro nao tratado`, {
    error: err instanceof Error ? err.message : String(err),
  });
  return res.status(500).json({
    error: "Erro interno do servidor",
    ...(isProduction ? {} : { detail: String(err) }),
  });
}

/** Rota nao encontrada (404). */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Rota nao encontrada" });
}
