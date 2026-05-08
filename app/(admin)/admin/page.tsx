'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { BarChart3, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useOperationsReport, useFinancialReport } from '@/api/hooks/useAdminReports';
import { useDashboardData } from '@/api/hooks/useAdminDashboard';
import { UserRole } from '@/api/types/user.types';
import { ReportFilters } from '@/components/admin/reports/ReportFilters';
import { OperationsReport } from '@/components/admin/reports/OperationsReport';
import { FinancialReport } from '@/components/admin/reports/FinancialReport';
import { DashboardAlerts } from '@/components/admin/dashboard/DashboardAlerts';
import { DashboardQuickActions } from '@/components/admin/dashboard/DashboardQuickActions';
import { DashboardKpiCards } from '@/components/admin/dashboard/DashboardKpiCards';
import { DashboardCorporatePulse } from '@/components/admin/dashboard/DashboardCorporatePulse';
import type { ReportGranularity } from '@/api/types/admin.types';

export default function AdminDashboard() {
  const user = useCurrentUser();
  const isSuperAdmin =
    user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const canViewOperations = useHasPermission(
    ['report:outlet', 'report:cross-outlet'],
    false,
  );
  const canViewFinancial = useHasPermission('report:financial');
  const canViewAnyReport = canViewOperations || canViewFinancial;

  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  const [filters, setFilters] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
    outletId: string | undefined;
    granularity: ReportGranularity;
  }>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    outletId: undefined,
    granularity: 'daily',
  });

  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setFilters((prev) => ({ ...prev, outletId: user.assigned_outlet_id }));
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

  useEffect(() => {
    if (canViewAnyOutlet && !filters.outletId && outletsData?.data?.length) {
      setFilters((prev) => ({
        ...prev,
        outletId: outletsData.data[0]._id,
      }));
    }
  }, [canViewAnyOutlet, filters.outletId, outletsData?.data]);

  const queryParams = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return null;
    const base = {
      start_date: format(filters.startDate, 'yyyy-MM-dd'),
      end_date: format(filters.endDate, 'yyyy-MM-dd'),
      outlet_id: filters.outletId,
    };
    return base;
  }, [filters.startDate, filters.endDate, filters.outletId]);

  const operationsParams = useMemo(() => {
    if (!queryParams) return null;
    return {
      ...queryParams,
      granularity: filters.granularity,
    };
  }, [queryParams, filters.granularity]);

  const financialParams = useMemo(() => {
    if (!queryParams) return null;
    return queryParams;
  }, [queryParams]);

  const {
    data: operationsData,
    isLoading: operationsLoading,
  } = useOperationsReport(operationsParams ?? { start_date: '', end_date: '' });

  const {
    data: financialData,
    isLoading: financialLoading,
  } = useFinancialReport(financialParams ?? { start_date: '', end_date: '' });

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
  } = useDashboardData();

  const handleFiltersChange = useCallback(
    (next: typeof filters) => {
      setFilters(next);
    },
    [],
  );

  const defaultTab = useMemo(() => {
    if (canViewOperations) return 'operations';
    if (canViewFinancial) return 'financial';
    return 'operations';
  }, [canViewOperations, canViewFinancial]);

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab((prev) => {
      if (prev === 'operations' && !canViewOperations && canViewFinancial) {
        return 'financial';
      }
      if (prev === 'financial' && !canViewFinancial && canViewOperations) {
        return 'operations';
      }
      return prev;
    });
  }, [canViewOperations, canViewFinancial]);

  if (!canViewAnyReport) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <div className="rounded-full bg-muted p-4 text-muted-foreground">
          <BarChart3 className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Access Denied
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You do not have permission to view reports. Contact your
            administrator for access.
          </p>
        </div>
      </div>
    );
  }

  const outlets = outletsData?.data ?? [];

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
      {canViewAnyReport && (
        <div className="space-y-4">
          <DashboardAlerts alerts={dashboardData?.alerts} isLoading={dashboardLoading} />
          <DashboardQuickActions />
          <DashboardKpiCards data={dashboardData} isLoading={dashboardLoading} />
          <DashboardCorporatePulse data={dashboardData?.corporate} isLoading={dashboardLoading} />
        </div>
      )}

      {/* Section Divider */}
      {canViewAnyReport && (
        <div className="flex items-center gap-4 pt-2">
          <div className="h-px flex-1 bg-border/60" />
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Reports & Analytics
            </h2>
          </div>
          <div className="h-px flex-1 bg-border/60" />
        </div>
      )}

      {/* Filters */}
      {outletsLoading ? (
        <Skeleton className="h-[72px] w-full rounded-xl" />
      ) : (
        <ReportFilters
          filters={filters}
          onChange={handleFiltersChange}
          outlets={outlets}
          canViewAnyOutlet={canViewAnyOutlet}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background p-1 shadow-sm border border-border/50 rounded-lg">
          {canViewOperations && (
            <TabsTrigger
              value="operations"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              Operations
            </TabsTrigger>
          )}
          {canViewFinancial && (
            <TabsTrigger
              value="financial"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              Financial
            </TabsTrigger>
          )}
        </TabsList>

        {canViewOperations && (
          <TabsContent value="operations">
            <OperationsReport
              data={operationsData ?? []}
              isLoading={operationsLoading}
            />
          </TabsContent>
        )}

        {canViewFinancial && (
          <TabsContent value="financial">
            <FinancialReport
              data={financialData}
              isLoading={financialLoading}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
