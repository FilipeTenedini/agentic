import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ConnectionStatus } from "@/types";

const STATUS_MAP: Record<
  ConnectionStatus,
  { label: string; variant: "success" | "secondary" | "warning"; icon: typeof CheckCircle2; spin?: boolean }
> = {
  connected: { label: "Conectado", variant: "success", icon: CheckCircle2 },
  connecting: { label: "Conectando...", variant: "warning", icon: Loader2, spin: true },
  reconnecting: { label: "Reconectando...", variant: "warning", icon: Loader2, spin: true },
  disconnected: { label: "Desconectado", variant: "secondary", icon: XCircle },
};

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config = STATUS_MAP[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant}>
      <Icon className={`size-3 ${config.spin ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}
