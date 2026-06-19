import { PersonalitySlider } from "@/components/agent/personality-slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMOJI_OPTIONS,
  PERSONALITY_SLIDERS,
  RESPONSE_LENGTH_OPTIONS,
  WRITING_STYLE_OPTIONS,
} from "@/mocks/personality";
import type { AgentPersonality } from "@/types";

interface PersonalityEditorProps {
  value: AgentPersonality;
  onChange: (patch: Partial<AgentPersonality>) => void;
  /** Quando true, exibe os nomes técnicos dos deslizadores. */
  advanced?: boolean;
  /** Prefixo para gerar ids únicos quando há mais de um editor na tela. */
  idPrefix?: string;
}

export function PersonalityEditor({
  value,
  onChange,
  advanced = false,
  idPrefix = "personality",
}: PersonalityEditorProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {PERSONALITY_SLIDERS.map((slider) => (
          <PersonalitySlider
            key={slider.key}
            id={`${idPrefix}-${slider.key}`}
            label={advanced ? slider.advancedLabel : slider.label}
            hint={slider.hint}
            minLabel={slider.minLabel}
            maxLabel={slider.maxLabel}
            value={value[slider.key]}
            onChange={(v) => onChange({ [slider.key]: v })}
          />
        ))}
      </div>

      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-style`}>Estilo de escrita</Label>
          <Select
            value={value.writingStyle}
            onValueChange={(v) =>
              onChange({ writingStyle: v as AgentPersonality["writingStyle"] })
            }
          >
            <SelectTrigger id={`${idPrefix}-style`}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {WRITING_STYLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-emoji`}>Uso de emojis</Label>
          <Select
            value={value.emojiUsage}
            onValueChange={(v) =>
              onChange({ emojiUsage: v as AgentPersonality["emojiUsage"] })
            }
          >
            <SelectTrigger id={`${idPrefix}-emoji`}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {EMOJI_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-length`}>Tamanho médio das respostas</Label>
          <Select
            value={value.responseLength}
            onValueChange={(v) =>
              onChange({ responseLength: v as AgentPersonality["responseLength"] })
            }
          >
            <SelectTrigger id={`${idPrefix}-length`}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {RESPONSE_LENGTH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
