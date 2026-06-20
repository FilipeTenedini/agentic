import { Router } from "express";
import { asyncHandler } from "../../shared/utils/http.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import * as activityController from "./activity.controller.js";

export const activityRouter = Router();

activityRouter.get("/", requireAuth, asyncHandler(activityController.list));
