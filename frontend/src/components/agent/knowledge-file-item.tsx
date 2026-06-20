import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  RotateCw,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  KNOWLEDGE_FILE_TYPE_LABELS,
  formatFileSize,
} from "@/mocks/knowledge-base";
import { cn } from "@/lib/utils";
import type { KnowledgeFile } from "@/types";

interface KnowledgeFileItemProps {
  file: KnowledgeFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

function StatusBadge({ file }: { file: KnowledgeFile }) {
  switch (file.status) {
    case "ready":
      return (
        <Badge variant="success">
          <CheckCircle2 className="size-3" />
          Pronto
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="warning">
          <Loader2 className="size-3 animate-spin" />
          Processando
        </Badge>
      );
    case "uploading":
      return (
        <Badge variant="secondary">
          <Loader2 className="size-3 animate-spin" />
          Enviando
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive">
          <TriangleAlert className="size-3" />
          Erro
        </Badge>
      );
  }
}

export function KnowledgeFileItem({
  file,
  onRemove,
  onRetry,
}: KnowledgeFileItemProps) {
  const isBusy = file.status === "uploading" || file.status === "processing";

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          file.status === "error"
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        )}
      >
        <FileSpreadsheet className="size-5" />
      </span>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <StatusBadge file={file} />
        </div>

        <p className="text-xs text-muted-foreground">
          {KNOWLEDGE_FILE_TYPE_LABELS[file.type]} · {formatFileSize(file.sizeBytes)}
          {file.status === "ready" && file.chunks != null && (
            <> · {file.chunks} trechos indexados</>
          )}
        </p>

        {isBusy && typeof file.progress === "number" && (
          <Progress
            value={file.progress}
            className="h-1.5"
            indicatorClassName={
              file.status === "processing" ? "bg-warning" : "bg-primary"
            }
          />
        )}

        {file.status === "error" && file.errorMessage && (
          <p className="text-xs text-destructive">{file.errorMessage}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {file.status === "error" && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onRetry(file.id)}
            aria-label="Tentar novamente"
          >
            <RotateCw className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(file.id)}
          disabled={isBusy}
          aria-label="Remover arquivo"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
