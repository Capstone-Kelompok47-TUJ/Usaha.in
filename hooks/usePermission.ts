import { useCurrentUser } from "./useCurrentUser";
import { can } from "@/lib/permissions";
import type { ModuleKey } from "@/types";

/**
 * Hook untuk cek hak akses modul tertentu.
 */
export function usePermission(module: ModuleKey) {
  const user = useCurrentUser();
  return {
    canView: can(user, module, "view"),
    canManage: can(user, module, "manage"),
    isOwner: user?.isOwner ?? false,
  };
}
