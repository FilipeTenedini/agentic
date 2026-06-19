import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChat } from "@/contexts/chat-context";
import { useSettings } from "@/contexts/settings-context";
import { ROUTES } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/utils";

export function RecentConversationsCard() {
  const { conversations } = useChat();
  const { settings } = useSettings();
  const recent = [...conversations]
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Últimas conversas</CardTitle>
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="size-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {!settings.personalUse.enabled ? (
          <p className="text-sm text-muted-foreground">
            Ative o uso pessoal em "Meu Agente" para conversar pelo chat interno.
          </p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((conv) => (
              <li key={conv.id}>
                <Link
                  to={`${ROUTES.chat}/${conv.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-primary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{conv.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.lastMessage}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeDate(conv.lastMessageAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {settings.personalUse.enabled && recent.length > 0 && (
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to={ROUTES.chat}>
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
