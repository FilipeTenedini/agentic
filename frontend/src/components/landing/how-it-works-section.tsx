const STEPS = [
  {
    number: "1",
    title: "Crie sua conta",
    description: "Cadastre-se em segundos e acesse seu painel, sem precisar de cartão.",
  },
  {
    number: "2",
    title: "Conecte seus canais",
    description:
      "Ative o WhatsApp e o assistente pessoal com um clique. Tudo guiado, sem código.",
  },
  {
    number: "3",
    title: "Deixe o assistente trabalhar",
    description:
      "Seu assistente passa a responder e ajudar você, enquanto você foca no que importa.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-muted-foreground">
            Três passos simples para começar a automatizar seu atendimento.
          </p>
        </div>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
                {step.number}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
