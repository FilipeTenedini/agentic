import { useEffect, useState } from "react";
import {
  Database,
  MessageCircle,
  MessageSquare,
  Settings,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";
import type { Activity, ActivityType } from "@/types";

const ICONS: Record<ActivityType, LucideIcon> = {
  whatsapp: MessageCircle,
  chat: MessageSquare,
  config: Settings,
  knowledge: Database,
  personality: SlidersHorizontal,
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    api.activities
      .list()
      .then(setActivities)
      .catch((err) => console.error("Falha ao carregar atividades:", err));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade recente</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {activities.map((activity) => {
            const Icon = ICONS[activity.type];
            return (
              <li
                key={activity.id}
                className="flex items-center gap-3 rounded-md px-2 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-sm">{activity.description}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(activity.timestamp)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
