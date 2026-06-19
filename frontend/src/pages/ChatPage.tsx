import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";

import { ChatThread } from "@/components/chat/chat-thread";
import { ConversationList } from "@/components/chat/conversation-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { useSettings } from "@/contexts/settings-context";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ChatPage() {
  const { settings } = useSettings();
  const { conversations, createConversation } = useChat();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  if (!settings.personalUse.enabled) {
    return <Navigate to={ROUTES.agent} replace />;
  }

  const conversation = conversations.find((c) => c.id === conversationId);

  function handleNew() {
    const id = createConversation();
    navigate(`${ROUTES.chat}/${id}`);
  }

  return (
    <div className="flex h-full">
      <aside
        className={cn(
          "w-full shrink-0 border-r lg:w-80",
          conversationId && "hidden lg:block"
        )}
      >
        <ConversationList />
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1",
          !conversationId && "hidden lg:block"
        )}
      >
        {conversation ? (
          <ChatThread conversation={conversation} onBack={() => navigate(ROUTES.chat)} />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              icon={MessageSquare}
              title="Selecione uma conversa"
              description="Escolha uma conversa na lista ou comece uma nova para conversar com seu assistente."
              action={<Button onClick={handleNew}>Nova conversa</Button>}
            />
          </div>
        )}
      </section>
    </div>
  );
}
