import { Router } from "express";
import { asyncHandler } from "../../shared/utils/http.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.js";
import * as subscriptionController from "./subscription.controller.js";
import { updatePlanSchema } from "./subscription.dto.js";

export const subscriptionRouter = Router();

subscriptionRouter.get(
  "/",
  requireAuth,
  asyncHandler(subscriptionController.get)
);
subscriptionRouter.put(
  "/",
  requireAuth,
  validate(updatePlanSchema),
  asyncHandler(subscriptionController.update)
);

// Catalogo de planos (publico — usado no modal de upgrade).
export const planRouter = Router();
planRouter.get("/", asyncHandler(subscriptionController.plans));
