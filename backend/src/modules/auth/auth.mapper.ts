import type { User } from "@prisma/client";

/** Shape de usuario exposto pela API (espelha frontend `User`). */
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    createdAt: user.createdAt.toISOString(),
  };
}
