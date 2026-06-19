import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Circle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useChat } from "@/contexts/chat-context";
import { useSettings } from "@/contexts/settings-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OnboardingChecklist() {
  const { settings } = useSettings();
  const { conversations } = useChat();
  const [dismissed, setDismissed] = useLocalStorage(STORAGE_KEYS.onboarding, false);

  const hasSentMessage = conversations.some((c) => c.messageCount > 0);

  const steps = [
    {
      label: "Conectar o WhatsApp",
      done: settings.whatsapp.connectionStatus === "connected",
      to: ROUTES.agent,
    },
    {
      label: "Ativar o uso pessoal",
      done: settings.personalUse.enabled,
      to: ROUTES.agent,
    },
    {
      label: "Enviar a primeira mensagem no chat",
      done: hasSentMessage,
      to: settings.personalUse.enabled ? ROUTES.chat : ROUTES.agent,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  if (dismissed || completed === steps.length) return null;

  return (
    <Card className="border-primary/30 bg-accent/40">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">Configure seu assistente</CardTitle>
          <p className="text-sm text-muted-foreground">
            {completed} de {steps.length} passos concluídos
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Dispensar"
          onClick={() => setDismissed(true)}
        >
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <ul className="space-y-1">
          {steps.map((step) => (
            <li key={step.label}>
              <Link
                to={step.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-background/60",
                  step.done && "text-muted-foreground"
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="size-5 text-success" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" />
                )}
                <span className={cn("flex-1", step.done && "line-through")}>
                  {step.label}
                </span>
                {!step.done && <ArrowRight className="size-4 text-muted-foreground" />}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
