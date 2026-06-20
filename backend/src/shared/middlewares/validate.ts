import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny, infer as ZodInfer } from "zod";

type Source = "body" | "query" | "params";

/**
 * Middleware de validacao com Zod. Substitui a parte validada de req pelo
 * resultado parseado (com tipos/coercoes aplicados).
 */
export function validate(schema: ZodTypeAny, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);
    // params/query sao read-only em alguns setups; usamos Object.assign.
    if (source === "body") {
      req.body = parsed;
    } else {
      Object.assign(req[source], parsed);
    }
    next();
  };
}

export type Infer<T extends ZodTypeAny> = ZodInfer<T>;
