import { useStore } from "@/lib/store";

/**
 * Hook untuk mendapatkan user yang sedang aktif.
 */
export function useCurrentUser() {
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  return users.find((u) => u.id === currentUserId) ?? null;
}
