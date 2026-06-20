import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Senha obrigatoria"),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).optional(),
    avatarUrl: z.string().optional(),
  })
  .refine((data) => data.name !== undefined || data.avatarUrl !== undefined, {
    message: "Informe ao menos um campo para atualizar",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
