import { Link } from "react-router-dom";
import { MessageCircle, Settings2, Sparkles } from "lucide-react";

import { ConnectionStatusBadge } from "@/components/shared/connection-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/contexts/settings-context";
import { AGENT_STATUS_LABELS, AGENT_STATUS_VARIANT } from "@/lib/agent-status";
import { ROUTES } from "@/lib/constants";

export function AgentStatusCard() {
  const { settings } = useSettings();
  const { agent, whatsapp, personalUse } = settings;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Status do agente</CardTitle>
        <Badge variant={AGENT_STATUS_VARIANT[agent.status]}>
          {AGENT_STATUS_LABELS[agent.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">{agent.name}</p>
            <p className="text-xs text-muted-foreground">
              {whatsapp.enabled || personalUse.enabled
                ? "Pronto para atender"
                : "Nenhum canal ativo"}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <MessageCircle className="size-4 text-whatsapp" />
              WhatsApp
            </span>
            {whatsapp.enabled ? (
              <ConnectionStatusBadge status={whatsapp.connectionStatus} />
            ) : (
              <Badge variant="secondary">Desativado</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 text-primary" />
              Uso pessoal
            </span>
            <Badge variant={personalUse.enabled ? "success" : "secondary"}>
              {personalUse.enabled ? "Ativo" : "Desativado"}
            </Badge>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={ROUTES.agent}>
            <Settings2 className="size-4" />
            Configurar agente
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
