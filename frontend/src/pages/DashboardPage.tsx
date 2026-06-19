import { AgentStatusCard } from "@/components/dashboard/agent-status-card";
import { KnowledgeHealthCard } from "@/components/dashboard/knowledge-health-card";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { PendingSetupCard } from "@/components/dashboard/pending-setup-card";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RecentConversationsCard } from "@/components/dashboard/recent-conversations-card";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { PageContainer } from "@/components/shared/page-container";

export function DashboardPage() {
  return (
    <PageContainer>
      <WelcomeBanner />
      <OnboardingChecklist />
      <QuickStats />
      <div className="grid gap-4 lg:grid-cols-2">
        <AgentStatusCard />
        <KnowledgeHealthCard />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentConversationsCard />
        <PendingSetupCard />
      </div>
      <RecentActivity />
    </PageContainer>
  );
}
