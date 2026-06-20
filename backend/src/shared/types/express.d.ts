import type { JwtPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware de autenticacao em rotas protegidas. */
      user?: JwtPayload;
    }
  }
}

export {};
