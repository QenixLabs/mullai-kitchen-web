'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { BarChart3, CalendarDays, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useOperationsReport, useFinancialReport } from '@/api/hooks/useAdminReports';
import { UserRole } from '@/api/types/user.types';
import { ReportFilters } from '@/components/admin/reports/ReportFilters';
import { OperationsReport } from '@/components/admin/reports/OperationsReport';
import { FinancialReport } from '@/components/admin/reports/FinancialReport';
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

  // Bootstrap outlet selection for non-super-admins
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

  const handleFiltersChange = useCallback(
    (next: typeof filters) => {
      setFilters(next);
    },
    [],
  );

  // Determine default active tab
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
          <Lock className="h-8 w-8" />
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
  const dateRangeLabel =
    filters.startDate && filters.endDate
      ? `${format(filters.startDate, 'dd MMM yyyy')} – ${format(
          filters.endDate,
          'dd MMM yyyy',
        )}`
      : '—';

  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <BarChart3 className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Operations and financial performance across outlets and time
              periods.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <CalendarDays className="h-3 w-3" />
            {dateRangeLabel}
          </Badge>
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <BarChart3 className="h-3 w-3" />
            {filters.granularity}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      {outletsLoading ? (
        <Skeleton className="h-[72px] w-full rounded-md" />
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
        <TabsList>
          {canViewOperations && (
            <TabsTrigger value="operations">Operations</TabsTrigger>
          )}
          {canViewFinancial && (
            <TabsTrigger value="financial">Financial</TabsTrigger>
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
