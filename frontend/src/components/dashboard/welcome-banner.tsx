import { useAuth } from "@/contexts/auth-context";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function WelcomeBanner() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting()}, {firstName}
      </h1>
      <p className="text-sm text-muted-foreground">
        Aqui está um resumo do seu assistente hoje.
      </p>
    </div>
  );
}
