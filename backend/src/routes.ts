import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { agentRouter } from "./modules/agents/agent.routes.js";
import { knowledgeRouter } from "./modules/knowledge/knowledge.routes.js";
import { chatRouter } from "./modules/chats/chat.routes.js";
import {
  subscriptionRouter,
  planRouter,
} from "./modules/subscriptions/subscription.routes.js";
import { activityRouter } from "./modules/activities/activity.routes.js";
import { webhookRouter } from "./modules/webhooks/webhook.routes.js";

/** Agrega todas as rotas da API sob /api. */
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/agent", agentRouter);
apiRouter.use("/knowledge", knowledgeRouter);
apiRouter.use("/conversations", chatRouter);
apiRouter.use("/subscription", subscriptionRouter);
apiRouter.use("/plans", planRouter);
apiRouter.use("/activities", activityRouter);
apiRouter.use("/webhooks", webhookRouter);
