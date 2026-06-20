import type { NextFunction, Request, Response } from "express";
import { Unauthorized } from "../../infra/http/errors.js";
import { verifyToken } from "../utils/jwt.js";

/**
 * Protege rotas: exige `Authorization: Bearer <token>`. Em caso de sucesso,
 * preenche `req.user` com { userId, email }.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw Unauthorized("Token de autenticacao ausente");
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw Unauthorized("Token invalido ou expirado");
  }
}

/** Helper para obter o userId garantido em rotas protegidas. */
export function getUserId(req: Request): string {
  if (!req.user) throw Unauthorized();
  return req.user.userId;
}
