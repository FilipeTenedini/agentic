import { useState } from "react";
import {
  MessageCircle,
  Pencil,
  RefreshCw,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AgentEditModal } from "@/components/agent/agent-edit-modal";
import { ConnectionStatusBadge } from "@/components/shared/connection-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/settings-context";
import { DEFAULT_PERSONALITY, WRITING_STYLE_OPTIONS } from "@/mocks/personality";
import type { ChannelId } from "@/types";

interface ChannelMeta {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
}

const CHANNEL_META: Record<ChannelId, ChannelMeta> = {
  personalUse: {
    title: "Uso pessoal",
    description: "Converse com seu assistente diretamente no painel, pelo chat interno.",
    icon: Sparkles,
    iconBg: "bg-primary/10 text-primary",
  },
  whatsapp: {
    title: "WhatsApp",
    description: "Seu assistente responde automaticamente os clientes no WhatsApp.",
    icon: MessageCircle,
    iconBg: "bg-whatsapp/15 text-whatsapp",
  },
};

export function AgentChannelCard({ channelId }: { channelId: ChannelId }) {
  const { settings, toggleWhatsApp, reconnectWhatsApp, togglePersonalUse } =
    useSettings();
  const [editOpen, setEditOpen] = useState(false);

  const meta = CHANNEL_META[channelId];
  const Icon = meta.icon;
  const channel = settings[channelId];
  const isWhatsApp = channelId === "whatsapp";
  const whatsapp = settings.whatsapp;

  const isBusy =
    isWhatsApp &&
    (whatsapp.connectionStatus === "connecting" ||
      whatsapp.connectionStatus === "reconnecting");

  function handleToggle(enabled: boolean) {
    if (isWhatsApp) {
      toggleWhatsApp(enabled);
      toast[enabled ? "success" : "message"](
        enabled ? "Conectando o WhatsApp..." : "WhatsApp desativado."
      );
    } else {
      togglePersonalUse(enabled);
      toast[enabled ? "success" : "message"](
        enabled ? "Uso pessoal ativado. O chat está disponível." : "Uso pessoal desativado."
      );
    }
  }

  // Personalidade efetiva: a do canal ou a padrão
  const effectivePersonality = channel.personality ?? DEFAULT_PERSONALITY;
  const styleLabel =
    WRITING_STYLE_OPTIONS.find((s) => s.value === effectivePersonality.writingStyle)?.label ?? "—";

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-start gap-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}
            >
              <Icon className="size-5" />
            </span>
            <div className="space-y-1">
              <CardTitle className="text-base">{meta.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>
          <Switch
            checked={channel.enabled}
            onCheckedChange={handleToggle}
            disabled={isBusy}
            aria-label={`Ativar ${meta.title}`}
          />
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          {/* Status de conexão (WhatsApp) */}
          {isWhatsApp && channel.enabled && (
            <>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {whatsapp.phoneNumber ?? "Número não definido"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ConnectionStatusBadge status={whatsapp.connectionStatus} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reconnectWhatsApp}
                    disabled={isBusy}
                  >
                    <RefreshCw className={isBusy ? "animate-spin" : ""} />
                    Reconectar
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Badge de status + botão editar */}
          <div className="mt-auto flex items-center justify-between">
            <Badge variant={channel.enabled ? "success" : "secondary"}>
              {channel.enabled ? "Ativo" : "Desativado"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      <AgentEditModal
        channelId={channelId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
