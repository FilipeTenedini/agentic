import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useLocalStorage("flowassist_prefs", {
    emailNotifications: true,
    productUpdates: false,
    weeklyReport: true,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Configurações"
        description="Ajuste suas preferências gerais da plataforma."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid max-w-md grid-cols-3 gap-3">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                    active
                      ? "border-primary bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notificações</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {[
            {
              key: "emailNotifications" as const,
              title: "Notificações por email",
              description: "Receba avisos importantes sobre sua conta.",
            },
            {
              key: "productUpdates" as const,
              title: "Novidades do produto",
              description: "Fique por dentro de novos recursos e melhorias.",
            },
            {
              key: "weeklyReport" as const,
              title: "Relatório semanal",
              description: "Um resumo do desempenho do seu assistente toda semana.",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{item.title}</Label>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={prefs[item.key]}
                onCheckedChange={(value) =>
                  setPrefs((prev) => ({ ...prev, [item.key]: value }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Idioma e região</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Idioma</Label>
              <p className="text-sm text-muted-foreground">Português (Brasil)</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="space-y-0.5 text-right">
              <Label className="text-sm font-medium">Fuso horário</Label>
              <p className="text-sm text-muted-foreground">GMT-3 (Brasília)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
