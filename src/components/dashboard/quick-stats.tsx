import { MessageCircle, MessagesSquare, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ConnectionStatusBadge } from "@/components/shared/connection-status-badge";
import { useChat } from "@/contexts/chat-context";
import { useSettings } from "@/contexts/settings-context";
import { DEMO_SUBSCRIPTION } from "@/mocks/subscription";

export function QuickStats() {
  const { settings } = useSettings();
  const { conversations } = useChat();
  const { whatsappMessages } = DEMO_SUBSCRIPTION.limits;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg bg-whatsapp/15 text-whatsapp">
              <MessageCircle className="size-4" />
            </span>
            <ConnectionStatusBadge status={settings.whatsapp.connectionStatus} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">WhatsApp</p>
            <p className="text-lg font-semibold">
              {settings.whatsapp.enabled ? "Ativo" : "Desativado"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessagesSquare className="size-4" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Conversas no chat</p>
            <p className="text-2xl font-semibold">{conversations.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Mensagens respondidas</p>
            <p className="text-2xl font-semibold">
              {whatsappMessages.used}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {whatsappMessages.max}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
