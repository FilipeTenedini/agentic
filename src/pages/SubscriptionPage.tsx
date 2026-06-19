import { useState } from "react";
import { CalendarClock, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PlanComparisonModal } from "@/components/subscription/plan-comparison-modal";
import { UsageProgress } from "@/components/subscription/usage-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEMO_SUBSCRIPTION, PLANS } from "@/mocks/subscription";
import { formatDate } from "@/lib/utils";
import type { PlanId } from "@/types";

export function SubscriptionPage() {
  const [subscription, setSubscription] = useState(DEMO_SUBSCRIPTION);
  const [modalOpen, setModalOpen] = useState(false);

  function handleSelectPlan(planId: PlanId) {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;
    setSubscription((prev) => ({
      ...prev,
      plan: plan.id,
      planName: plan.name,
      price: plan.price,
    }));
    setModalOpen(false);
    toast.success(`Plano alterado para ${plan.name}.`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Assinatura"
        description="Acompanhe seu plano e o uso da plataforma."
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </span>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                Plano {subscription.planName}
                <Badge variant="success">Ativo</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                R$ {subscription.price} / mês
              </p>
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)}>Alterar plano</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" />
            Renova em {formatDate(subscription.renewalDate)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Limites de uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <UsageProgress
            label="Mensagens no WhatsApp"
            usage={subscription.limits.whatsappMessages}
          />
          <UsageProgress
            label="Mensagens no chat"
            usage={subscription.limits.chatMessages}
          />
          <UsageProgress
            label="Conversas"
            usage={subscription.limits.conversations}
          />
        </CardContent>
      </Card>

      <PlanComparisonModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentPlan={subscription.plan}
        onSelect={handleSelectPlan}
      />
    </PageContainer>
  );
}
