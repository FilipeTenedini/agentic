import { z } from "zod";

export const updatePlanSchema = z.object({
  plan: z.enum(["free", "starter", "pro", "business"]),
});

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
