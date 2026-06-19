import { CheckCircle2, MessageSquare, Send, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-2xl ring-1 ring-black/5",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
        <span className="size-3 rounded-full bg-destructive/60" />
        <span className="size-3 rounded-full bg-warning/60" />
        <span className="size-3 rounded-full bg-success/60" />
        <span className="ml-3 text-xs text-muted-foreground">app.flowassist.com</span>
      </div>

      <div className="grid grid-cols-[140px_1fr] text-left">
        <div className="hidden flex-col gap-1 border-r bg-sidebar p-3 sm:flex">
          {["Dashboard", "Meu Agente", "Chat", "Assinatura"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                i === 1 ? "bg-accent font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="size-3 rounded bg-current opacity-40" />
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Meu Agente</p>
              <p className="text-xs text-muted-foreground">Configure seus canais</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
              <CheckCircle2 className="size-3" /> Conectado
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-whatsapp/15 text-whatsapp">
                <MessageSquare className="size-4" />
              </span>
              <div>
                <p className="text-xs font-medium">WhatsApp</p>
                <p className="text-[10px] text-muted-foreground">+55 11 98765-4321</p>
              </div>
            </div>
            <span className="h-5 w-9 rounded-full bg-primary p-0.5">
              <span className="block size-4 translate-x-4 rounded-full bg-white" />
            </span>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </span>
              <p className="text-xs font-medium">Assistente respondendo...</p>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-md bg-muted px-2 py-1.5">
              <span className="flex-1 text-[10px] text-muted-foreground">
                Olá! Como posso ajudar você hoje?
              </span>
              <Send className="size-3 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
