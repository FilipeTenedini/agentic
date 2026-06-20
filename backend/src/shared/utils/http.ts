import type { NextFunction, Request, Response } from "express";

/**
 * Envolve um controller assincrono para encaminhar erros ao errorHandler
 * sem precisar de try/catch em cada rota.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
