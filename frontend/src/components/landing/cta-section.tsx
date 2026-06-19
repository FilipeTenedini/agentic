import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function CtaSection() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.18), transparent 40%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Pronto para ter um assistente trabalhando por você?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              Crie sua conta gratuitamente e configure seu atendimento inteligente hoje
              mesmo.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to={ROUTES.register}>
                Começar grátis <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
