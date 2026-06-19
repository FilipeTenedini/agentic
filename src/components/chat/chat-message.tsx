import { Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { cn, formatTime, getInitials } from "@/lib/utils";
import type { Message } from "@/types";

export function ChatMessage({ message }: { message: Message }) {
  const { user } = useAuth();
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex animate-fade-in items-start gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {isUser ? (
        <Avatar className="size-8 border">
          <AvatarImage src={user?.avatarUrl} alt={user?.name} />
          <AvatarFallback>{getInitials(user?.name ?? "U")}</AvatarFallback>
        </Avatar>
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
      )}

      <div className={cn("flex max-w-[78%] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted text-foreground"
          )}
        >
          {message.content}
        </div>
        <span className="px-1 text-[11px] text-muted-foreground">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
