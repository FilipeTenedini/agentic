import type { Request, Response } from "express";
import { getUserId } from "../../shared/middlewares/auth.middleware.js";
import * as agentService from "./agent.service.js";
import * as whatsappService from "./whatsapp.service.js";
import type {
  PersonalityInput,
  UpdateAgentProfileInput,
  UpdateChannelInput,
} from "./agent.dto.js";

export async function getAgent(req: Request, res: Response) {
  res.json(await agentService.getSettings(getUserId(req)));
}

export async function updateProfile(req: Request, res: Response) {
  const result = await agentService.updateProfile(
    getUserId(req),
    req.body as UpdateAgentProfileInput
  );
  res.json(result);
}

export async function updateBasePersonality(req: Request, res: Response) {
  const result = await agentService.updateBasePersonality(
    getUserId(req),
    req.body as PersonalityInput
  );
  res.json(result);
}

export async function updateBaseInstructions(req: Request, res: Response) {
  const result = await agentService.updateBaseInstructions(
    getUserId(req),
    (req.body as { instructions: string }).instructions
  );
  res.json(result);
}

export async function updateChannel(req: Request, res: Response) {
  const channelId = req.params.channelId as "whatsapp" | "personalUse";
  const result = await agentService.updateChannel(
    getUserId(req),
    channelId,
    req.body as UpdateChannelInput
  );
  res.json(result);
}

export async function whatsappStatus(req: Request, res: Response) {
  res.json(await whatsappService.getStatus(getUserId(req)));
}

export async function whatsappQr(req: Request, res: Response) {
  res.json(await whatsappService.getQrCode(getUserId(req)));
}

export async function whatsappConnect(req: Request, res: Response) {
  res.json(await whatsappService.connect(getUserId(req)));
}

export async function whatsappReconnect(req: Request, res: Response) {
  res.json(await whatsappService.reconnect(getUserId(req)));
}

export async function whatsappDisconnect(req: Request, res: Response) {
  res.json(await whatsappService.disconnect(getUserId(req)));
}
