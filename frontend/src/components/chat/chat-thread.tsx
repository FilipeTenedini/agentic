import { useEffect, useRef } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

import { ChatMessage } from "@/components/chat/chat-message";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import type { Conversation } from "@/types";

interface ChatThreadProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatThread({ conversation, onBack }: ChatThreadProps) {
  const { getMessages, sendMessage, typingConversationId } = useChat();
  const messages = getMessages(conversation.id);
  const isTyping = typingConversationId === conversation.id;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onBack}
            aria-label="Voltar"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{conversation.title}</p>
          <p className="text-xs text-muted-foreground">Assistente FlowAssist</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 && !isTyping ? (
          <ChatEmptyState onPick={(text) => sendMessage(conversation.id, text)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4 md:p-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatInput
        onSend={(content) => sendMessage(conversation.id, content)}
        disabled={isTyping}
      />
    </div>
  );
}
