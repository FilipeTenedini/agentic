import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/mocks/subscription";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/types";

interface PlanComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanId;
  onSelect: (planId: PlanId) => void;
}

export function PlanComparisonModal({
  open,
  onOpenChange,
  currentPlan,
  onSelect,
}: PlanComparisonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Escolha seu plano</DialogTitle>
          <DialogDescription>
            Faça upgrade ou downgrade quando quiser. As mudanças são simuladas nesta demo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-xl border p-4",
                  plan.highlighted && "border-primary"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{plan.name}</p>
                  {isCurrent && <Badge variant="secondary">Atual</Badge>}
                </div>
                <p className="mt-2">
                  <span className="text-2xl font-bold">
                    {plan.price === 0 ? "R$ 0" : `R$ ${plan.price}`}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4 w-full"
                  size="sm"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() => onSelect(plan.id)}
                >
                  {isCurrent ? "Plano atual" : "Selecionar"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
