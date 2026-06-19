import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PersonalitySliderProps {
  id: string;
  label: string;
  hint?: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  onChange: (value: number) => void;
}

export function PersonalitySlider({
  id,
  label,
  hint,
  minLabel,
  maxLabel,
  value,
  onChange,
}: PersonalitySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={id}>{label}</Label>
          {hint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground/70 hover:text-foreground"
                  aria-label={`Sobre ${label}`}
                >
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{hint}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {value}
        </span>
      </div>
      <Slider
        id={id}
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={(values) => onChange(values[0] ?? 0)}
        aria-label={label}
      />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
