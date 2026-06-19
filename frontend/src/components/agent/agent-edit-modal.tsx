import { useState } from "react";
import {
  BookOpen,
  MessageCircle,
  MessageSquareText,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { KnowledgeBaseSection } from "@/components/agent/knowledge-base-section";
import { PersonalityEditor } from "@/components/agent/personality-editor";
import { PersonalityPresets } from "@/components/agent/personality-presets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/contexts/settings-context";
import { DEFAULT_PERSONALITY } from "@/mocks/personality";
import type { AgentPersonality, ChannelId } from "@/types";

interface ChannelMeta {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  instructionsPlaceholder: string;
}

const CHANNEL_META: Record<ChannelId, ChannelMeta> = {
  personalUse: {
    title: "Uso pessoal",
    icon: Sparkles,
    iconBg: "bg-primary/10 text-primary",
    instructionsPlaceholder:
      "Ex.: No chat interno, pode ser mais técnico e detalhado.\n\nSempre use listas e marcadores para organizar a resposta.",
  },
  whatsapp: {
    title: "WhatsApp",
    icon: MessageCircle,
    iconBg: "bg-whatsapp/15 text-whatsapp",
    instructionsPlaceholder:
      "Ex.: No WhatsApp, seja breve e objetivo.\n\nEvite listas longas — prefira respostas em até 3 frases.\n\nSempre finalize com uma pergunta para engajar o cliente.",
  },
};

interface AgentEditModalProps {
  channelId: ChannelId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentEditModal({
  channelId,
  open,
  onOpenChange,
}: AgentEditModalProps) {
  const { settings, setChannelPersonality, updateChannelConfig } = useSettings();
  const [tab, setTab] = useState("personality");

  const meta = CHANNEL_META[channelId];
  const Icon = meta.icon;
  const channel = settings[channelId];

  // Personalidade efetiva: própria do canal ou a padrão
  const effectivePersonality: AgentPersonality =
    channel.personality ?? { ...DEFAULT_PERSONALITY };

  function handlePersonalityChange(patch: Partial<AgentPersonality>) {
    setChannelPersonality(channelId, { ...effectivePersonality, ...patch });
  }

  function handleApplyPreset(personality: AgentPersonality) {
    setChannelPersonality(channelId, personality);
    toast.success("Modelo de personalidade aplicado.");
  }

  function handleInstructionsChange(value: string) {
    updateChannelConfig(channelId, { instructions: value });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
        {/* Cabeçalho fixo */}
        <DialogHeader className="flex-row items-center gap-3 border-b px-6 py-4">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}
          >
            <Icon className="size-5" />
          </span>
          <DialogTitle>Editar — {meta.title}</DialogTitle>
        </DialogHeader>

        {/* Abas + conteúdo com scroll */}
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b px-6 pt-3">
            <TabsList className="h-auto bg-transparent p-0 gap-1">
              <TabsTrigger
                value="personality"
                className="gap-1.5 rounded-none border-b-2 border-transparent pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <SlidersHorizontal className="size-4" />
                Personalidade
              </TabsTrigger>
              <TabsTrigger
                value="instructions"
                className="gap-1.5 rounded-none border-b-2 border-transparent pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <MessageSquareText className="size-4" />
                Instruções
              </TabsTrigger>
              <TabsTrigger
                value="knowledge"
                className="gap-1.5 rounded-none border-b-2 border-transparent pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <BookOpen className="size-4" />
                Base de Conhecimento
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            {/* Personalidade */}
            <TabsContent value="personality" className="m-0 px-6 py-5 space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Defina como o assistente se comporta especificamente neste canal.
                </p>
              </div>
              <PersonalityPresets onApply={handleApplyPreset} />
              <Separator />
              <PersonalityEditor
                value={effectivePersonality}
                onChange={handlePersonalityChange}
                idPrefix={`modal-${channelId}`}
              />
            </TabsContent>

            {/* Instruções */}
            <TabsContent value="instructions" className="m-0 px-6 py-5 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Instruções específicas</p>
                <p className="text-sm text-muted-foreground">
                  Regras exclusivas para este canal. Salvo automaticamente.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Como responder",
                  "Como NÃO responder",
                  "Tom e estilo do canal",
                  "Regras de negócio",
                ].map((tip) => (
                  <span
                    key={tip}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tip}
                  </span>
                ))}
              </div>
              <Textarea
                value={channel.instructions}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                placeholder={meta.instructionsPlaceholder}
                className="min-h-[220px] resize-y font-normal leading-relaxed"
              />
              <p className="text-right text-xs text-muted-foreground">
                {channel.instructions.length} caracteres
              </p>
            </TabsContent>

            {/* Base de Conhecimento */}
            <TabsContent value="knowledge" className="m-0 px-6 py-5">
              <KnowledgeBaseSection />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
