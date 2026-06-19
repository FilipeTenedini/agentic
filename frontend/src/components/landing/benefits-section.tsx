import { Clock, MessageCircle, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const BENEFITS = [
  {
    icon: Clock,
    title: "Atendimento 24/7",
    description:
      "Seu assistente responde a qualquer hora, sem deixar nenhum cliente esperando.",
  },
  {
    icon: MessageCircle,
    title: "Direto no WhatsApp",
    description:
      "Atenda no canal que seus clientes já usam, com respostas rápidas e consistentes.",
  },
  {
    icon: Sparkles,
    title: "Assistente pessoal",
    description:
      "Use o chat interno para organizar ideias, redigir mensagens e ganhar tempo.",
  },
  {
    icon: TrendingUp,
    title: "Mais conversões",
    description:
      "Respostas ágeis aumentam a satisfação e ajudam a fechar mais negócios.",
  },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="border-t bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Tudo o que você precisa para atender melhor
          </h2>
          <p className="mt-4 text-muted-foreground">
            Uma plataforma simples que coloca a inteligência a favor do seu negócio.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="space-y-3 p-6">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
