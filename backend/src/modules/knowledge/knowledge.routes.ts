import { Router } from "express";
import multer from "multer";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../shared/utils/http.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import { requireWebhookSecret } from "../../shared/middlewares/webhook-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.js";
import * as knowledgeController from "./knowledge.controller.js";
import { chunksSchema, fileStatusSchema, searchSchema } from "./knowledge.dto.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES },
});

export const knowledgeRouter = Router();

// --- Rotas do usuario (JWT) ---
knowledgeRouter.get(
  "/files",
  requireAuth,
  asyncHandler(knowledgeController.listFiles)
);
knowledgeRouter.post(
  "/files",
  requireAuth,
  upload.single("file"),
  asyncHandler(knowledgeController.uploadFile)
);
knowledgeRouter.get(
  "/files/:fileId",
  requireAuth,
  asyncHandler(knowledgeController.getFile)
);
knowledgeRouter.delete(
  "/files/:fileId",
  requireAuth,
  asyncHandler(knowledgeController.removeFile)
);
knowledgeRouter.post(
  "/files/:fileId/retry",
  requireAuth,
  asyncHandler(knowledgeController.retryFile)
);
knowledgeRouter.post(
  "/search",
  requireAuth,
  validate(searchSchema),
  asyncHandler(knowledgeController.search)
);

// --- Callbacks do N8N (webhook secret) ---
knowledgeRouter.put(
  "/files/:fileId",
  requireWebhookSecret,
  validate(fileStatusSchema),
  asyncHandler(knowledgeController.updateFileStatus)
);
knowledgeRouter.post(
  "/files/:fileId/chunks",
  requireWebhookSecret,
  validate(chunksSchema),
  asyncHandler(knowledgeController.saveChunks)
);
