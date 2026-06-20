import { useEffect, useState } from "react";
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
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { PlanId, Subscription } from "@/types";

export function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.subscription
      .get()
      .then(setSubscription)
      .catch((err) => console.error("Falha ao carregar assinatura:", err));
  }, []);

  async function handleSelectPlan(planId: PlanId) {
    try {
      const updated = await api.subscription.update(planId);
      setSubscription(updated);
      setModalOpen(false);
      toast.success(`Plano alterado para ${updated.planName}.`);
    } catch {
      toast.error("Não foi possível alterar o plano. Tente novamente.");
    }
  }

  if (!subscription) {
    return (
      <PageContainer>
        <PageHeader
          title="Assinatura"
          description="Acompanhe seu plano e o uso da plataforma."
        />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </PageContainer>
    );
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
