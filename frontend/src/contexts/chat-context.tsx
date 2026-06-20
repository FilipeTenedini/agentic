import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { Conversation, Message } from "@/types";

interface ChatContextValue {
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  typingConversationId: string | null;
  createConversation: () => Promise<string>;
  sendMessage: (conversationId: string, content: string) => void;
  getMessages: (conversationId: string) => Message[];
  loadMessages: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const tempId = () => `tmp-${Math.random().toString(36).slice(2, 10)}`;

function summarize(content: string): string {
  return content.length > 48 ? `${content.slice(0, 45)}...` : content;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, Message[]>
  >({});
  const [typingConversationId, setTypingConversationId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setMessagesByConversation({});
      return;
    }
    api.chat
      .listConversations()
      .then(setConversations)
      .catch((err) => console.error("Falha ao carregar conversas:", err));
  }, [isAuthenticated]);

  const loadMessages = useCallback((conversationId: string) => {
    if (conversationId.startsWith("tmp-")) return;
    api.chat
      .getMessages(conversationId)
      .then((messages) =>
        setMessagesByConversation((prev) => ({ ...prev, [conversationId]: messages }))
      )
      .catch((err) => console.error("Falha ao carregar mensagens:", err));
  }, []);

  const createConversation = useCallback(async (): Promise<string> => {
    const conversation = await api.chat.createConversation();
    setConversations((prev) => [conversation, ...prev]);
    setMessagesByConversation((prev) => ({ ...prev, [conversation.id]: [] }));
    return conversation.id;
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const now = new Date().toISOString();
      const optimisticUser: Message = {
        id: tempId(),
        conversationId,
        role: "user",
        content: trimmed,
        createdAt: now,
      };

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), optimisticUser],
      }));
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                title: conv.messageCount === 0 ? summarize(trimmed) : conv.title,
                lastMessage: summarize(trimmed),
                lastMessageAt: now,
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
      setTypingConversationId(conversationId);

      api.chat
        .sendMessage(conversationId, trimmed)
        .then(({ userMessage, assistantMessage }) => {
          setMessagesByConversation((prev) => {
            const without = (prev[conversationId] ?? []).filter(
              (m) => m.id !== optimisticUser.id
            );
            return {
              ...prev,
              [conversationId]: [...without, userMessage, assistantMessage],
            };
          });
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage: summarize(assistantMessage.content),
                    lastMessageAt: assistantMessage.createdAt,
                    messageCount: conv.messageCount + 1,
                  }
                : conv
            )
          );
        })
        .catch((err) => {
          console.error("Falha ao enviar mensagem:", err);
        })
        .finally(() => setTypingConversationId(null));
    },
    []
  );

  const getMessages = useCallback(
    (conversationId: string) => messagesByConversation[conversationId] ?? [],
    [messagesByConversation]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      messagesByConversation,
      typingConversationId,
      createConversation,
      sendMessage,
      getMessages,
      loadMessages,
    }),
    [
      conversations,
      messagesByConversation,
      typingConversationId,
      createConversation,
      sendMessage,
      getMessages,
      loadMessages,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat deve ser usado dentro de ChatProvider");
  return ctx;
}
