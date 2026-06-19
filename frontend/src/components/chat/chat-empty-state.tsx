import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Escreva um post para o Instagram",
  "Crie um rascunho de email para um cliente",
  "Resuma os pontos de uma reunião",
  "Monte um roteiro de vendas",
];

export function ChatEmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Como posso ajudar?</h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma sugestão ou escreva sua própria mensagem.
        </p>
      </div>
      <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onPick(suggestion)}
            className="rounded-xl border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
