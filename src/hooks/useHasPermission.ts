import { useMemo } from 'react';
import { useUserStore } from '@/providers/user-store-provider';

/**
 * Check if the current user has specific permission(s)
 *
 * @param permissions - Single permission string or array of permissions
 * @param requireAll - If true, user must have ALL permissions (default: true)
 * @returns Boolean indicating if user has the required permission(s)
 *
 * @example
 * // Check single permission
 * const canCreateOutlets = useHasPermission('outlet:create');
 *
 * @example
 * // Check multiple permissions (must have all)
 * const canManageUsers = useHasPermission(['user:create:admin', 'user:view:any']);
 *
 * @example
 * // Check multiple permissions (must have at least one)
 * const canEditAny = useHasPermission(['outlet:edit:any', 'outlet:edit:own'], false);
 */
export function useHasPermission(
  permissions: string | string[],
  requireAll: boolean = true,
): boolean {
  const user = useUserStore((store) => store.user);
  const userPermissions = user?.permissions || [];

  return useMemo(() => {
    const required = Array.isArray(permissions) ? permissions : [permissions];

    if (requireAll) {
      return required.every((p) => userPermissions.includes(p));
    } else {
      return required.some((p) => userPermissions.includes(p));
    }
  }, [permissions, requireAll, userPermissions]);
}
