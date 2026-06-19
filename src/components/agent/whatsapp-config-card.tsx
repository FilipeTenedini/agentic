import { MessageCircle, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { ConnectionStatusBadge } from "@/components/shared/connection-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/settings-context";

export function WhatsAppConfigCard() {
  const { settings, toggleWhatsApp, reconnectWhatsApp } = useSettings();
  const { whatsapp } = settings;
  const isBusy =
    whatsapp.connectionStatus === "connecting" ||
    whatsapp.connectionStatus === "reconnecting";

  function handleToggle(enabled: boolean) {
    toggleWhatsApp(enabled);
    toast[enabled ? "success" : "message"](
      enabled ? "Conectando o WhatsApp..." : "WhatsApp desativado."
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-whatsapp/15 text-whatsapp">
            <MessageCircle className="size-5" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-base">WhatsApp</CardTitle>
            <p className="text-sm text-muted-foreground">
              Permita que seu assistente responda automaticamente no WhatsApp.
            </p>
          </div>
        </div>
        <Switch
          checked={whatsapp.enabled}
          onCheckedChange={handleToggle}
          disabled={isBusy}
          aria-label="Habilitar WhatsApp"
        />
      </CardHeader>

      {whatsapp.enabled && (
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Smartphone className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  {whatsapp.phoneNumber ?? "Número não definido"}
                </p>
                <p className="text-xs text-muted-foreground">Número conectado</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
        </CardContent>
      )}
    </Card>
  );
}
