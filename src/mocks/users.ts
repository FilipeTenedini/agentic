import type { User } from "@/types";

export const DEMO_USER: User = {
  id: "user-001",
  name: "Maria Silva",
  email: "demo@flowassist.com",
  avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Maria%20Silva&backgroundColor=7c3aed",
  createdAt: "2025-01-15T10:00:00Z",
};

export function createMockUser(name: string, email: string): User {
  return {
    id: `user-${Math.random().toString(36).slice(2, 10)}`,
    name,
    email,
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
      name
    )}&backgroundColor=7c3aed`,
    createdAt: new Date().toISOString(),
  };
}
