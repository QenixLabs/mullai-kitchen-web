'use client';

import { ReactNode } from 'react';
import { useHasPermission } from '@/hooks/useHasPermission';

export interface CanProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditional rendering component based on user permissions
 *
 * @param permission - Single permission string or array of permissions to check
 * @param requireAll - If true (default), user must have all permissions. If false, user needs any one.
 * @param fallback - Optional component to render when user lacks permissions
 * @param children - Content to render when user has required permissions
 *
 * @example
 * // Single permission check
 * <Can permission="outlet:create">
 *   <Button>Create Outlet</Button>
 * </Can>
 *
 * // Multiple permissions - require all
 * <Can permission={['user:view:any', 'user:edit:role']} requireAll={true}>
 *   <UserManagementPanel />
 * </Can>
 *
 * // Multiple permissions - require any
 * <Can permission={['outlet:view:any', 'outlet:view:own']} requireAll={false}>
 *   <OutletList />
 * </Can>
 *
 * // With fallback
 * <Can permission="config:system" fallback={<AccessDenied />}>
 *   <SystemConfig />
 * </Can>
 */
export function Can({
  permission,
  requireAll = true,
  fallback = null,
  children,
}: CanProps) {
  const hasPermission = useHasPermission(permission, requireAll);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
