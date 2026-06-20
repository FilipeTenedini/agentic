import type { Request, Response } from "express";
import { getUserId } from "../../shared/middlewares/auth.middleware.js";
import * as chatService from "./chat.service.js";
import type { InternalConversationInput, SendMessageInput } from "./chat.dto.js";

export async function list(req: Request, res: Response) {
  res.json(await chatService.listConversations(getUserId(req)));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await chatService.createConversation(getUserId(req)));
}

export async function getOne(req: Request, res: Response) {
  res.json(await chatService.getConversation(getUserId(req), req.params.id));
}

export async function getMessages(req: Request, res: Response) {
  res.json(await chatService.getMessages(getUserId(req), req.params.id));
}

export async function remove(req: Request, res: Response) {
  await chatService.deleteConversation(getUserId(req), req.params.id);
  res.json({ ok: true });
}

export async function sendMessage(req: Request, res: Response) {
  const { content } = req.body as SendMessageInput;
  res.json(await chatService.sendMessage(getUserId(req), req.params.id, content));
}

// --- Callback do N8N (webhook secret) ---
export async function saveInternal(req: Request, res: Response) {
  res
    .status(201)
    .json(
      await chatService.saveInternalConversation(
        req.body as InternalConversationInput
      )
    );
}
