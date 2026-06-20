import type { Request, Response } from "express";
import { getUserId } from "../../shared/middlewares/auth.middleware.js";
import * as authService from "./auth.service.js";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "./auth.dto.js";

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body as LoginInput);
  res.json(result);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(getUserId(req));
  res.json(user);
}

export async function updateProfile(req: Request, res: Response) {
  const user = await authService.updateProfile(
    getUserId(req),
    req.body as UpdateProfileInput
  );
  res.json(user);
}

export async function logout(_req: Request, res: Response) {
  // JWT stateless: o frontend descarta o token. Endpoint existe por simetria.
  res.json({ ok: true });
}
