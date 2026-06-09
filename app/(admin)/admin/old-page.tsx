'use client';

import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useDashboardData } from '@/api/hooks/useAdminDashboard';
import { UserRole } from '@/api/types/user.types';
import { DashboardAlerts } from '@/components/admin/dashboard/DashboardAlerts';
import { DashboardQuickActions } from '@/components/admin/dashboard/DashboardQuickActions';
import { DashboardKpiCards } from '@/components/admin/dashboard/DashboardKpiCards';
import { DashboardCorporatePulse } from '@/components/admin/dashboard/DashboardCorporatePulse';
import { DashboardIngredientUsage } from '@/components/admin/dashboard/DashboardIngredientUsage';

export default function AdminDashboard() {
  const user = useCurrentUser();
  const isSuperAdmin =
    user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;
  const canViewInventory = useHasPermission('inventory:view');

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
  } = useDashboardData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground shadow-lg shadow-primary/20">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview, alerts, and reports across all outlets.
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="h-8 gap-1.5 border-0 bg-primary/5 px-3 text-[11px] font-semibold uppercase tracking-wide text-primary"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live Data
        </Badge>
      </div>

      {/* Dashboard Overview */}
      <div className="space-y-4">
        <DashboardAlerts alerts={dashboardData?.alerts} isLoading={dashboardLoading} />
        <DashboardQuickActions />
        <DashboardKpiCards data={dashboardData} isLoading={dashboardLoading} />
        <DashboardCorporatePulse data={dashboardData?.corporate} isLoading={dashboardLoading} />
        {canViewInventory && (
          <DashboardIngredientUsage
            data={dashboardData?.ingredientUsage}
            isLoading={dashboardLoading}
          />
        )}
      </div>
    </div>
  );
}
