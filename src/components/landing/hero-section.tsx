import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60% 60% at 50% 0%, hsl(var(--primary) / 0.12), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6 md:py-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Seu assistente inteligente, pronto em minutos
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
          Automatize seu atendimento e atenda melhor, sem complicação
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
          Tenha um assistente inteligente trabalhando por você — respondendo no WhatsApp e
          ajudando no seu painel, 24 horas por dia.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to={ROUTES.register}>
              Começar grátis <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={ROUTES.login}>Entrar</Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Sem cartão de crédito · Cancele quando quiser
        </p>

        <div className="mx-auto mt-16 max-w-3xl animate-fade-up">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
