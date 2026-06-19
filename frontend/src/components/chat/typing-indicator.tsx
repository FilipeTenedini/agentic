export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1" aria-label="Assistente digitando">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-typing-dot rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
