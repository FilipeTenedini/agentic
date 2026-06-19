import { CheckCircle2, Database, Loader2, TriangleAlert } from "lucide-react";

import { KnowledgeFileList } from "@/components/agent/knowledge-file-list";
import { KnowledgeFileUpload } from "@/components/agent/knowledge-file-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKnowledgeBase } from "@/contexts/knowledge-base-context";
import { formatFileSize } from "@/mocks/knowledge-base";

export function KnowledgeBaseSection() {
  const { summary } = useKnowledgeBase();
  const inProgress = summary.uploading + summary.processing;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-5 text-primary" />
          Base de Conhecimento
        </CardTitle>
        <CardDescription>
          Envie materiais para o assistente consultar. No futuro, esse conteúdo
          alimentará a busca inteligente (RAG). Por enquanto, é uma demonstração.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Arquivos</p>
            <p className="text-xl font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3 text-success" /> Prontos
            </p>
            <p className="text-xl font-semibold">{summary.ready}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="size-3" /> Em processo
            </p>
            <p className="text-xl font-semibold">{inProgress}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <TriangleAlert className="size-3 text-destructive" /> Com erro
            </p>
            <p className="text-xl font-semibold">{summary.error}</p>
          </div>
        </div>

        <KnowledgeFileUpload />

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Arquivos enviados</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(summary.totalSizeBytes)} no total
          </p>
        </div>
        <KnowledgeFileList />
      </CardContent>
    </Card>
  );
}
