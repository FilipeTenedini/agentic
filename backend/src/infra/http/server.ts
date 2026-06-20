import express, { type Express } from "express";
import cors from "cors";
import { corsOrigins } from "../../config/env.js";
import { apiRouter } from "../../routes.js";
import { errorHandler, notFoundHandler } from "./errors.js";

/** Cria e configura a instancia do Express com middlewares globais e rotas. */
export function createServer(): Express {
  const app = express();

  app.use(
    cors({
      origin: corsOrigins.length === 1 && corsOrigins[0] === "*" ? true : corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck simples (util para deploy / docker).
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
