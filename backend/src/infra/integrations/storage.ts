import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, resolve, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";

/**
 * Abstracao simples de storage de arquivos da Base de Conhecimento.
 * Driver 'local' grava em ./uploads. GANCHO: trocar por S3/Supabase no futuro
 * implementando o mesmo contrato (saveFile / deleteFile).
 */

const LOCAL_DIR = resolve(process.cwd(), env.STORAGE_LOCAL_DIR);

export interface StoredFile {
  /** Caminho/URL para recuperar o arquivo depois (usado pelo N8N no RAG). */
  storageUrl: string;
}

export async function saveFile(
  originalName: string,
  buffer: Buffer
): Promise<StoredFile> {
  if (env.STORAGE_DRIVER !== "local") {
    // Placeholder: implementar upload para S3/Supabase quando necessario.
    throw new Error(
      `Storage driver '${env.STORAGE_DRIVER}' ainda nao implementado.`
    );
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  const safeExt = extname(originalName).slice(0, 12);
  const fileName = `${randomUUID()}${safeExt}`;
  const fullPath = join(LOCAL_DIR, fileName);
  await writeFile(fullPath, buffer);

  return { storageUrl: `local://${fileName}` };
}

export async function deleteFile(storageUrl?: string | null): Promise<void> {
  if (!storageUrl || !storageUrl.startsWith("local://")) return;
  const fileName = storageUrl.slice("local://".length);
  try {
    await unlink(join(LOCAL_DIR, fileName));
  } catch {
    // Arquivo ja removido ou inexistente: ignora.
  }
}
