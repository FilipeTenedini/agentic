import { Router } from "express";
import { asyncHandler } from "../../shared/utils/http.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.js";
import * as agentController from "./agent.controller.js";
import {
  channelIdSchema,
  personalitySchema,
  updateChannelSchema,
  updateInstructionsSchema,
  updateProfileSchema,
} from "./agent.dto.js";

export const agentRouter = Router();

agentRouter.use(requireAuth);

agentRouter.get("/", asyncHandler(agentController.getAgent));

agentRouter.put(
  "/profile",
  validate(updateProfileSchema),
  asyncHandler(agentController.updateProfile)
);

agentRouter.put(
  "/personality/base",
  validate(personalitySchema),
  asyncHandler(agentController.updateBasePersonality)
);

agentRouter.put(
  "/instructions/base",
  validate(updateInstructionsSchema),
  asyncHandler(agentController.updateBaseInstructions)
);

agentRouter.put(
  "/channels/:channelId",
  validate(channelIdSchema, "params"),
  validate(updateChannelSchema),
  asyncHandler(agentController.updateChannel)
);

// --- WhatsApp ---
agentRouter.get("/whatsapp/status", asyncHandler(agentController.whatsappStatus));
agentRouter.get("/whatsapp/qr", asyncHandler(agentController.whatsappQr));
agentRouter.post("/whatsapp/connect", asyncHandler(agentController.whatsappConnect));
agentRouter.post(
  "/whatsapp/reconnect",
  asyncHandler(agentController.whatsappReconnect)
);
agentRouter.post(
  "/whatsapp/disconnect",
  asyncHandler(agentController.whatsappDisconnect)
);
