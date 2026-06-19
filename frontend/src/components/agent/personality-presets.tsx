import { Wand2 } from "lucide-react";

import { PERSONALITY_PRESETS } from "@/mocks/personality";
import type { AgentPersonality } from "@/types";

interface PersonalityPresetsProps {
  onApply: (personality: AgentPersonality) => void;
}

export function PersonalityPresets({ onApply }: PersonalityPresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Wand2 className="size-4 text-primary" />
        Comece por um modelo
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PERSONALITY_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset.personality)}
            className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/60 hover:bg-accent"
          >
            <p className="text-sm font-medium">{preset.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {preset.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
