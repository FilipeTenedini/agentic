import { Router } from "express";
import { asyncHandler } from "../../shared/utils/http.js";
import { requireWebhookSecret } from "../../shared/middlewares/webhook-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.js";
import * as internalController from "./internal.controller.js";
import { embedProxySchema } from "./internal.dto.js";

export const internalRouter = Router();

internalRouter.post(
  "/embed",
  requireWebhookSecret,
  validate(embedProxySchema),
  asyncHandler(internalController.proxyEmbed)
);
