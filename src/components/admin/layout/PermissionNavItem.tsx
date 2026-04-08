"use client";

import { ReactNode } from "react";
import { Can } from "@/components/Auth/can";

export interface PermissionNavItemProps {
  /** Single permission or array of permissions to check */
  permission?: string | string[];
  /** If true, user must have ALL permissions; if false, user needs ANY one */
  requireAll?: boolean;
  /** The navigation item content */
  children: ReactNode;
}

/**
 * A wrapper component for navigation items that conditionally renders
 * based on user permissions.
 *
 * @example
 * // Single permission
 * <PermissionNavItem permission="outlet:view:any">
 *   <Link href="/admin/outlets">Outlets</Link>
 * </PermissionNavItem>
 *
 * @example
 * // Multiple permissions - require any
 * <PermissionNavItem permission={['user:view:any', 'user:view:outlet']} requireAll={false}>
 *   <Link href="/admin/users">Users</Link>
 * </PermissionNavItem>
 *
 * @example
 * // No permission required (always visible)
 * <PermissionNavItem>
 *   <Link href="/admin">Dashboard</Link>
 * </PermissionNavItem>
 */
export function PermissionNavItem({
  permission,
  requireAll = true,
  children,
}: PermissionNavItemProps) {
  // If no permission is required, render children directly
  if (!permission) {
    return <>{children}</>;
  }

  return (
    <Can permission={permission} requireAll={requireAll}>
      {children}
    </Can>
  );
}
