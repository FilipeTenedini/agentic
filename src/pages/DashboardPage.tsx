import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { PageContainer } from "@/components/shared/page-container";

export function DashboardPage() {
  return (
    <PageContainer>
      <WelcomeBanner />
      <OnboardingChecklist />
      <QuickStats />
      <RecentActivity />
    </PageContainer>
  );
}
