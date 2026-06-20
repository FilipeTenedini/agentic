import { Router } from "express";
import { asyncHandler } from "../../shared/utils/http.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import { requireWebhookSecret } from "../../shared/middlewares/webhook-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.js";
import * as chatController from "./chat.controller.js";
import { internalConversationSchema, sendMessageSchema } from "./chat.dto.js";

export const chatRouter = Router();

// --- Callback do N8N (webhook secret) — antes do requireAuth global ---
chatRouter.post(
  "/internal",
  requireWebhookSecret,
  validate(internalConversationSchema),
  asyncHandler(chatController.saveInternal)
);

// --- Rotas do usuario (JWT) ---
chatRouter.get("/", requireAuth, asyncHandler(chatController.list));
chatRouter.post("/", requireAuth, asyncHandler(chatController.create));
chatRouter.get("/:id", requireAuth, asyncHandler(chatController.getOne));
chatRouter.get(
  "/:id/messages",
  requireAuth,
  asyncHandler(chatController.getMessages)
);
chatRouter.delete("/:id", requireAuth, asyncHandler(chatController.remove));
chatRouter.post(
  "/:id/messages",
  requireAuth,
  validate(sendMessageSchema),
  asyncHandler(chatController.sendMessage)
);
