import type { Request, Response } from "express";
import { getUserId } from "../../shared/middlewares/auth.middleware.js";
import { listActivities } from "./activity.service.js";

export async function list(req: Request, res: Response) {
  const activities = await listActivities(getUserId(req));
  res.json(activities);
}
