import { extname, basename } from "node:path";
import { randomUUID } from "node:crypto";
import {
  uploadObject,
  deleteObject,
  objectExists,
  getSignedDownloadUrl as s3GetSignedDownloadUrl,
} from "./s3.service.js";

export interface StoredFile {
  /** Referencia permanente do arquivo no S3 (usado pelo N8N no RAG). */
  storageUrl: string;
}

const S3_PREFIX = "s3://";

function sanitizeFileName(originalName: string): string {
  const ext = extname(originalName).slice(0, 12);
  const base = basename(originalName, ext)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
  return `${base || randomUUID()}${ext}`;
}

function contentTypeFromName(fileName: string): string {
  const ext = extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".csv": "text/csv",
  };
  return map[ext] ?? "application/octet-stream";
}

export function buildObjectKey(userId: string, fileName: string): string {
  return `${userId}/${fileName}`;
}

export function buildStorageUrl(userId: string, fileName: string): string {
  return `${S3_PREFIX}${buildObjectKey(userId, fileName)}`;
}

export function parseStorageKey(storageUrl: string): string | null {
  if (storageUrl.startsWith(S3_PREFIX)) {
    return storageUrl.slice(S3_PREFIX.length);
  }
  return null;
}

async function uniqueFileName(userId: string, fileName: string): Promise<string> {
  let candidate = fileName;
  for (let attempt = 0; attempt < 100; attempt++) {
    const exists = await objectExists(buildObjectKey(userId, candidate));
    if (!exists) return candidate;

    const ext = extname(fileName);
    const base = basename(fileName, ext);
    candidate = `${base}-${randomUUID().slice(0, 8)}${ext}`;
  }
  return `${randomUUID()}${extname(fileName)}`;
}

export async function saveFile(
  userId: string,
  originalName: string,
  buffer: Buffer
): Promise<StoredFile> {
  const fileName = await uniqueFileName(userId, sanitizeFileName(originalName));
  const key = buildObjectKey(userId, fileName);

  await uploadObject(key, buffer, contentTypeFromName(fileName));

  return { storageUrl: buildStorageUrl(userId, fileName) };
}

export async function deleteFile(storageUrl?: string | null): Promise<void> {
  const key = storageUrl ? parseStorageKey(storageUrl) : null;
  if (!key) return;

  try {
    await deleteObject(key);
  } catch {
    // Objeto ja removido ou inexistente: ignora.
  }
}

export async function getSignedDownloadUrl(
  storageUrl: string
): Promise<string> {
  const key = parseStorageKey(storageUrl);
  if (!key) {
    throw new Error(`storageUrl invalido para S3: ${storageUrl}`);
  }
  return s3GetSignedDownloadUrl(key);
}
