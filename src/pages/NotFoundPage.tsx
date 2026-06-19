import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/lib/constants";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo />
      <div className="space-y-2">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="text-xl font-semibold">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
      </div>
      <Button asChild>
        <Link to={ROUTES.landing}>Voltar ao início</Link>
      </Button>
    </div>
  );
}
