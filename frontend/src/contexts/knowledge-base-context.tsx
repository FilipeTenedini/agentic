import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { api, getToken } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import {
  ALLOWED_KNOWLEDGE_FILE_MESSAGE,
  isAllowedKnowledgeFileName,
} from "@/mocks/knowledge-base";
import type { KnowledgeFile } from "@/types";

interface KnowledgeBaseContextValue {
  files: KnowledgeFile[];
  summary: {
    total: number;
    ready: number;
    processing: number;
    uploading: number;
    error: number;
    totalSizeBytes: number;
  };
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  retryFile: (id: string) => void;
}

const KnowledgeBaseContext = createContext<KnowledgeBaseContextValue | null>(null);

const POLL_INTERVAL_MS = 2000;

const isPending = (f: KnowledgeFile) =>
  f.status === "uploading" || f.status === "processing";

export function KnowledgeBaseProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const pollTimerRef = useRef<number | null>(null);
  const pollingRef = useRef(false);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const stopPolling = useCallback(() => {
    clearPollTimer();
    pollingRef.current = false;
  }, [clearPollTimer]);

  const refresh = useCallback(async (): Promise<KnowledgeFile[] | null> => {
    if (!getToken()) return null;
    try {
      const list = await api.knowledge.list();
      setFiles(list);
      return list;
    } catch (err) {
      console.error("Falha ao carregar a base de conhecimento:", err);
      return null;
    }
  }, []);

  const schedulePollIfNeeded = useCallback(
    (list: KnowledgeFile[] | null) => {
      if (!list?.some(isPending)) {
        stopPolling();
        return;
      }
      if (pollingRef.current) return;
      pollingRef.current = true;

      const tick = async () => {
        clearPollTimer();
        if (!getToken()) {
          stopPolling();
          return;
        }
        if (document.hidden) {
          pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS);
          return;
        }
        const next = await refresh();
        if (next?.some(isPending)) {
          pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS);
        } else {
          stopPolling();
        }
      };

      pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS);
    },
    [clearPollTimer, refresh, stopPolling]
  );

  useEffect(() => {
    if (!isAuthenticated || !getToken()) {
      setFiles([]);
      stopPolling();
      return;
    }

    void refresh().then(schedulePollIfNeeded);

    return stopPolling;
  }, [isAuthenticated, refresh, schedulePollIfNeeded, stopPolling]);

  const hasPending = files.some(isPending);

  // Inicia polling quando um upload/retry deixa arquivos pendentes.
  useEffect(() => {
    if (!isAuthenticated) {
      stopPolling();
      return;
    }
    if (!hasPending) {
      stopPolling();
      return;
    }
    schedulePollIfNeeded(files);
  }, [hasPending, isAuthenticated, files, schedulePollIfNeeded, stopPolling]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    if (list.length === 0) return;

    const allowed = list.filter((file) => isAllowedKnowledgeFileName(file.name));
    const rejected = list.length - allowed.length;

    if (rejected > 0) {
      toast.error(ALLOWED_KNOWLEDGE_FILE_MESSAGE);
    }
    if (allowed.length === 0) return;

    toast.success(
      allowed.length === 1
        ? "Arquivo enviado. Processando..."
        : `${allowed.length} arquivos enviados. Processando...`
    );

    Promise.all(
      allowed.map((file) =>
        api.knowledge
          .upload(file)
          .then((created) => setFiles((prev) => [created, ...prev]))
          .catch((err) => {
            console.error("Falha no upload:", err);
            toast.error(
              err instanceof Error ? err.message : "Falha ao enviar arquivo."
            );
          })
      )
    ).catch(() => undefined);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    api.knowledge.remove(id).catch((err) => {
      console.error("Falha ao remover arquivo:", err);
    });
  }, []);

  const retryFile = useCallback((id: string) => {
    api.knowledge
      .retry(id)
      .then((updated) =>
        setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)))
      )
      .catch((err) => console.error("Falha ao reprocessar arquivo:", err));
  }, []);

  const summary = useMemo(() => {
    const base = {
      total: files.length,
      ready: 0,
      processing: 0,
      uploading: 0,
      error: 0,
      totalSizeBytes: 0,
    };
    for (const file of files) {
      base.totalSizeBytes += file.sizeBytes;
      if (file.status === "ready") base.ready += 1;
      else if (file.status === "processing") base.processing += 1;
      else if (file.status === "uploading") base.uploading += 1;
      else if (file.status === "error") base.error += 1;
    }
    return base;
  }, [files]);

  const value = useMemo<KnowledgeBaseContextValue>(
    () => ({ files, summary, addFiles, removeFile, retryFile }),
    [files, summary, addFiles, removeFile, retryFile]
  );

  return (
    <KnowledgeBaseContext.Provider value={value}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
}

export function useKnowledgeBase() {
  const ctx = useContext(KnowledgeBaseContext);
  if (!ctx)
    throw new Error(
      "useKnowledgeBase deve ser usado dentro de KnowledgeBaseProvider"
    );
  return ctx;
}
