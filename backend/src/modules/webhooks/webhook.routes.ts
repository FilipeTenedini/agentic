import { Router } from "express";
import { asyncHandler } from "../../shared/utils/http.js";
import { requireWebhookSecret } from "../../shared/middlewares/webhook-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.js";
import * as webhookController from "./webhook.controller.js";
import { connectionStatusSchema, evolutionEventSchema } from "./webhook.dto.js";

export const webhookRouter = Router();

webhookRouter.use(requireWebhookSecret);

webhookRouter.put(
  "/whatsapp-status",
  validate(connectionStatusSchema),
  asyncHandler(webhookController.whatsappStatus)
);

webhookRouter.post(
  "/evolution",
  validate(evolutionEventSchema),
  asyncHandler(webhookController.evolutionEvent)
);
