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

import {
  MOCK_KNOWLEDGE_FILES,
  getFileTypeFromName,
} from "@/mocks/knowledge-base";
import type { KnowledgeFile } from "@/types";

interface KnowledgeBaseContextValue {
  files: KnowledgeFile[];
  /** Resumo derivado, útil para o Dashboard. */
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

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `kf-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function KnowledgeBaseProvider({ children }: { children: ReactNode }) {
  // Estado em memória, semeado com os mocks. Não persistimos no localStorage para
  // que o refresh volte ao conjunto demonstrativo (e os arquivos "em processamento"
  // recomecem do estado original). Trocar por API real no futuro.
  const [files, setFiles] = useState<KnowledgeFile[]>(() => [
    ...MOCK_KNOWLEDGE_FILES,
  ]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const ids = timers.current;
    return () => {
      ids.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const patchFile = useCallback((id: string, patch: Partial<KnowledgeFile>) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...patch } : file))
    );
  }, []);

  // Simula upload -> processing -> ready | error usando timers encadeados.
  const simulate = useCallback(
    (id: string) => {
      // Fase de upload (progresso até 100)
      let uploadProgress = 0;
      const uploadStep = window.setInterval(() => {
        uploadProgress += 25;
        if (uploadProgress >= 100) {
          window.clearInterval(uploadStep);
          patchFile(id, { status: "processing", progress: 0 });
          // Fase de processamento
          let procProgress = 0;
          const procStep = window.setInterval(() => {
            procProgress += 20;
            if (procProgress >= 100) {
              window.clearInterval(procStep);
              const failed = Math.random() < 0.15;
              if (failed) {
                patchFile(id, {
                  status: "error",
                  progress: undefined,
                  errorMessage:
                    "Falha ao processar o arquivo. Tente enviar novamente.",
                });
              } else {
                const chunks = 8 + Math.floor(Math.random() * 120);
                patchFile(id, {
                  status: "ready",
                  progress: undefined,
                  chunks,
                  vectors: chunks,
                  indexedAt: new Date().toISOString(),
                });
              }
            } else {
              patchFile(id, { progress: procProgress });
            }
          }, 400);
          timers.current.push(procStep);
        } else {
          patchFile(id, { progress: uploadProgress });
        }
      }, 250);
      timers.current.push(uploadStep);
    },
    [patchFile]
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (list.length === 0) return;

      const newFiles: KnowledgeFile[] = list.map((file) => ({
        id: createId(),
        name: file.name,
        type: getFileTypeFromName(file.name),
        sizeBytes: file.size,
        status: "uploading",
        progress: 0,
        uploadedAt: new Date().toISOString(),
      }));

      setFiles((prev) => [...newFiles, ...prev]);
      newFiles.forEach((file) => simulate(file.id));
    },
    [simulate]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const retryFile = useCallback(
    (id: string) => {
      patchFile(id, {
        status: "uploading",
        progress: 0,
        errorMessage: undefined,
      });
      simulate(id);
    },
    [patchFile, simulate]
  );

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
