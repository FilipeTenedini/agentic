import { PersonalUseConfigCard } from "@/components/agent/personal-use-config-card";
import { WhatsAppConfigCard } from "@/components/agent/whatsapp-config-card";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";

export function AgentPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Meu Agente"
        description="Escolha como deseja usar seu assistente e ative os canais que precisar."
      />
      <div className="space-y-4">
        <WhatsAppConfigCard />
        <PersonalUseConfigCard />
      </div>
    </PageContainer>
  );
}
