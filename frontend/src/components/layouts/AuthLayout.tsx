import { Link, Navigate, Outlet } from "react-router-dom";
import { MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/lib/constants";

export function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.18), transparent 40%)",
          }}
        />
        <Link to={ROUTES.landing} className="relative">
          <Logo className="text-primary-foreground [&>span:first-child]:bg-white/15" />
        </Link>

        <div className="relative space-y-6">
          <h2 className="max-w-md text-3xl font-semibold leading-tight text-balance">
            Automatize seu atendimento e tenha um assistente inteligente trabalhando por você.
          </h2>
          <ul className="space-y-3 text-sm text-primary-foreground/90">
            <li className="flex items-center gap-3">
              <MessageCircle className="size-5" /> Atendimento no WhatsApp 24/7
            </li>
            <li className="flex items-center gap-3">
              <Sparkles className="size-5" /> Assistente pessoal no seu painel
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-5" /> Configuração simples, sem código
            </li>
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          "Reduzi o tempo de resposta dos meus clientes pela metade." — cliente FlowAssist
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to={ROUTES.landing}>
              <Logo />
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
