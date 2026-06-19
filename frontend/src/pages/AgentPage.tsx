import { AgentChannelCard } from "@/components/agent/agent-channel-card";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";

export function AgentPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Meu Agente"
        description="Ative os canais e personalize o comportamento do seu assistente em cada um."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <AgentChannelCard channelId="personalUse" />
        <AgentChannelCard channelId="whatsapp" />
      </div>
    </PageContainer>
  );
}
