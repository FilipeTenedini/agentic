import { Link } from "react-router-dom";
import { CircleCheck, ListChecks } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKnowledgeBase } from "@/contexts/knowledge-base-context";
import { useSettings } from "@/contexts/settings-context";
import { getPendingSetup } from "@/lib/agent-status";

export function PendingSetupCard() {
  const { settings } = useSettings();
  const { summary } = useKnowledgeBase();
  const pending = getPendingSetup(settings, summary);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Configurações pendentes</CardTitle>
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ListChecks className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <CircleCheck className="size-4" />
            Tudo configurado! Seu assistente está pronto.
          </div>
        ) : (
          <ul className="space-y-2">
            {pending.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3 text-sm transition-colors hover:border-primary/60 hover:bg-accent"
                >
                  <span>{item.label}</span>
                  <span className="shrink-0 text-xs font-medium text-primary">
                    Resolver
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
