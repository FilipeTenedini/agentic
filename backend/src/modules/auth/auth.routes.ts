import { Router } from "express";
import { asyncHandler } from "../../shared/utils/http.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.js";
import * as authController from "./auth.controller.js";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth.dto.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register)
);
authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
authRouter.put(
  "/profile",
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(authController.updateProfile)
);
authRouter.post("/logout", requireAuth, asyncHandler(authController.logout));
