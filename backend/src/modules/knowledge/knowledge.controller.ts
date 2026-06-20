import type { Request, Response } from "express";
import { getUserId } from "../../shared/middlewares/auth.middleware.js";
import { BadRequest } from "../../infra/http/errors.js";
import * as knowledgeService from "./knowledge.service.js";
import type { ChunksInput, FileStatusInput, SearchInput } from "./knowledge.dto.js";

export async function listFiles(req: Request, res: Response) {
  res.json(await knowledgeService.listFiles(getUserId(req)));
}

export async function getFile(req: Request, res: Response) {
  res.json(await knowledgeService.getFile(getUserId(req), req.params.fileId));
}

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) throw BadRequest("Nenhum arquivo enviado (campo 'file')");
  const result = await knowledgeService.addFile(getUserId(req), {
    originalname: req.file.originalname,
    size: req.file.size,
    buffer: req.file.buffer,
  });
  res.status(201).json(result);
}

export async function removeFile(req: Request, res: Response) {
  await knowledgeService.removeFile(getUserId(req), req.params.fileId);
  res.json({ ok: true });
}

export async function retryFile(req: Request, res: Response) {
  res.json(await knowledgeService.retryFile(getUserId(req), req.params.fileId));
}

export async function search(req: Request, res: Response) {
  const { query, topK } = req.body as SearchInput;
  res.json(await knowledgeService.search(getUserId(req), query, topK));
}

// --- Callbacks do N8N (protegidos por webhook secret) ---

export async function updateFileStatus(req: Request, res: Response) {
  res.json(
    await knowledgeService.updateFileStatus(
      req.params.fileId,
      req.body as FileStatusInput
    )
  );
}

export async function saveChunks(req: Request, res: Response) {
  res.json(
    await knowledgeService.saveChunks(req.params.fileId, req.body as ChunksInput)
  );
}
