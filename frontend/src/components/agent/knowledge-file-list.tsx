import { FileStack } from "lucide-react";

import { KnowledgeFileItem } from "@/components/agent/knowledge-file-item";
import { EmptyState } from "@/components/shared/empty-state";
import { useKnowledgeBase } from "@/contexts/knowledge-base-context";

export function KnowledgeFileList() {
  const { files, removeFile, retryFile } = useKnowledgeBase();

  if (files.length === 0) {
    return (
      <EmptyState
        icon={FileStack}
        title="Nenhum arquivo ainda"
        description="Envie documentos para o assistente aprender sobre o seu negócio."
      />
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <KnowledgeFileItem
          key={file.id}
          file={file}
          onRemove={removeFile}
          onRetry={retryFile}
        />
      ))}
    </div>
  );
}
