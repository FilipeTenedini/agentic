import { Link } from "react-router-dom";
import { CheckCircle2, Database, Loader2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useKnowledgeBase } from "@/contexts/knowledge-base-context";
import { ROUTES } from "@/lib/constants";

export function KnowledgeHealthCard() {
  const { summary } = useKnowledgeBase();
  const inProgress = summary.uploading + summary.processing;
  const readyPct = summary.total > 0 ? (summary.ready / summary.total) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Saúde da base de conhecimento</CardTitle>
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Database className="size-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-semibold">{summary.total}</p>
            <p className="text-xs text-muted-foreground">
              {summary.ready} de {summary.total} prontos
            </p>
          </div>
          <Progress value={readyPct} className="mt-2" indicatorClassName="bg-success" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border p-2">
            <CheckCircle2 className="mx-auto size-4 text-success" />
            <p className="mt-1 text-sm font-medium">{summary.ready}</p>
            <p className="text-[11px] text-muted-foreground">Prontos</p>
          </div>
          <div className="rounded-lg border p-2">
            <Loader2 className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-1 text-sm font-medium">{inProgress}</p>
            <p className="text-[11px] text-muted-foreground">Processando</p>
          </div>
          <div className="rounded-lg border p-2">
            <TriangleAlert className="mx-auto size-4 text-destructive" />
            <p className="mt-1 text-sm font-medium">{summary.error}</p>
            <p className="text-[11px] text-muted-foreground">Com erro</p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={`${ROUTES.agent}?tab=knowledge`}>Gerenciar arquivos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
