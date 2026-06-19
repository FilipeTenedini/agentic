import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/settings-context";
import { ROUTES } from "@/lib/constants";

export function PersonalUseConfigCard() {
  const { settings, togglePersonalUse } = useSettings();
  const enabled = settings.personalUse.enabled;

  function handleToggle(value: boolean) {
    togglePersonalUse(value);
    toast[value ? "success" : "message"](
      value ? "Uso pessoal ativado. O chat está disponível." : "Uso pessoal desativado."
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-base">Uso pessoal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Converse com seu assistente diretamente no painel, pelo chat interno.
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          aria-label="Ativar uso pessoal"
        />
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              O chat interno já está disponível na barra lateral.
            </p>
            <Button asChild size="sm">
              <Link to={ROUTES.chat}>
                Abrir chat <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
