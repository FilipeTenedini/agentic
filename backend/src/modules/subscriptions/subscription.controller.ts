import type { Request, Response } from "express";
import { getUserId } from "../../shared/middlewares/auth.middleware.js";
import * as subscriptionService from "./subscription.service.js";
import type { UpdatePlanInput } from "./subscription.dto.js";

export async function get(req: Request, res: Response) {
  res.json(await subscriptionService.getSubscription(getUserId(req)));
}

export async function update(req: Request, res: Response) {
  const { plan } = req.body as UpdatePlanInput;
  res.json(await subscriptionService.updatePlan(getUserId(req), plan));
}

export async function plans(_req: Request, res: Response) {
  res.json(subscriptionService.listPlans());
}
