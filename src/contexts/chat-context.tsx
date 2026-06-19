import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  MOCK_ASSISTANT_REPLIES,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from "@/mocks/conversations";
import type { Conversation, Message } from "@/types";

interface ChatContextValue {
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  typingConversationId: string | null;
  createConversation: () => string;
  sendMessage: (conversationId: string, content: string) => void;
  getMessages: (conversationId: string) => Message[];
}

const ChatContext = createContext<ChatContextValue | null>(null);

const genId = () => Math.random().toString(36).slice(2, 10);

function summarize(content: string): string {
  return content.length > 48 ? `${content.slice(0, 45)}...` : content;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messagesByConversation, setMessagesByConversation] =
    useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null);

  const createConversation = useCallback((): string => {
    const id = `conv-${genId()}`;
    const now = new Date().toISOString();
    setConversations((prev) => [
      {
        id,
        title: "Nova conversa",
        lastMessage: "",
        lastMessageAt: now,
        messageCount: 0,
      },
      ...prev,
    ]);
    setMessagesByConversation((prev) => ({ ...prev, [id]: [] }));
    return id;
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();
    const userMessage: Message = {
      id: `msg-${genId()}`,
      conversationId,
      role: "user",
      content: trimmed,
      createdAt: now,
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), userMessage],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              title:
                conv.messageCount === 0 ? summarize(trimmed) : conv.title,
              lastMessage: summarize(trimmed),
              lastMessageAt: now,
              messageCount: conv.messageCount + 1,
            }
          : conv
      )
    );

    setTypingConversationId(conversationId);

    const replyDelay = 1000 + Math.random() * 1000;
    window.setTimeout(() => {
      const reply =
        MOCK_ASSISTANT_REPLIES[
          Math.floor(Math.random() * MOCK_ASSISTANT_REPLIES.length)
        ];
      const replyTime = new Date().toISOString();
      const assistantMessage: Message = {
        id: `msg-${genId()}`,
        conversationId,
        role: "assistant",
        content: reply,
        createdAt: replyTime,
      };

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), assistantMessage],
      }));
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: summarize(reply),
                lastMessageAt: replyTime,
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
      setTypingConversationId(null);
    }, replyDelay);
  }, []);

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
    }),
    [
      conversations,
      messagesByConversation,
      typingConversationId,
      createConversation,
      sendMessage,
      getMessages,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat deve ser usado dentro de ChatProvider");
  return ctx;
}
