import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { UsageLimit } from "@/types";

interface UsageProgressProps {
  label: string;
  usage: UsageLimit;
}

export function UsageProgress({ label, usage }: UsageProgressProps) {
  const percent = Math.min(100, Math.round((usage.used / usage.max) * 100));
  const isHigh = percent >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {usage.used.toLocaleString("pt-BR")} /{" "}
          {usage.max.toLocaleString("pt-BR")}
        </span>
      </div>
      <Progress
        value={percent}
        indicatorClassName={cn(isHigh && "bg-warning")}
      />
    </div>
  );
}
