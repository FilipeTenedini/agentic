import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { useChat } from "@/contexts/chat-context";
import { ROUTES } from "@/lib/constants";
import { cn, formatRelativeDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export function ConversationList() {
  const { conversations, createConversation } = useChat();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(q) ||
        conv.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  async function handleNew() {
    const id = await createConversation();
    navigate(`${ROUTES.chat}/${id}`);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b p-3">
        <Button className="w-full" onClick={handleNew}>
          <Plus className="size-4" /> Nova conversa
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conversas"
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={MessageSquare}
              title={query ? "Nenhum resultado" : "Nenhuma conversa"}
              description={
                query
                  ? "Tente buscar por outro termo."
                  : "Comece uma nova conversa para vê-la aqui."
              }
            />
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {filtered.map((conv) => {
              const active = conv.id === conversationId;
              return (
                <li key={conv.id}>
                  <button
                    onClick={() => navigate(`${ROUTES.chat}/${conv.id}`)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                      active ? "bg-accent" : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{conv.title}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatRelativeDate(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {conv.lastMessage || "Sem mensagens ainda"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
