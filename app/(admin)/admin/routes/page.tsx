'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Route,
  Sparkles,
  CalendarDays,
  ListChecks,
  Truck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/Auth/can';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useOutletRoutes, useGenerateRoutes } from '@/api/hooks/useAdminRoutes';
import { UserRole } from '@/api/types/user.types';
import { RouteList } from '@/components/admin/routes/RouteList';
import { cn } from '@/lib/utils';

export default function RoutesPage() {
  const user = useCurrentUser();
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  const isSuperAdmin =
    user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

  useEffect(() => {
    if (canViewAnyOutlet && !selectedOutletId && outletsData?.data?.length) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [canViewAnyOutlet, selectedOutletId, outletsData?.data]);

  const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { data: routesData, isLoading: routesLoading } = useOutletRoutes(
    selectedOutletId,
    dateParam,
  );

  const generateRoutes = useGenerateRoutes(selectedOutletId ?? '');

  const handleOutletChange = useCallback((value: string) => {
    setSelectedOutletId(value);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!selectedOutletId || !dateParam) return;
    generateRoutes.mutate({ date: dateParam });
  }, [selectedOutletId, dateParam, generateRoutes]);

  const selectedOutlet = useMemo(
    () => outletsData?.data?.find((o) => o._id === selectedOutletId),
    [outletsData?.data, selectedOutletId],
  );

  const stats = useMemo(() => {
    const routes = routesData ?? [];
    const total = routes.length;
    const draft = routes.filter((r) => r.status === 'DRAFT').length;
    const published = routes.filter((r) => r.status === 'PUBLISHED').length;
    const inProgress = routes.filter((r) => r.status === 'IN_PROGRESS').length;
    const completed = routes.filter((r) => r.status === 'COMPLETED').length;
    const totalOrders = routes.reduce((sum, r) => sum + (r.order_count ?? 0), 0);
    const completedStops = routes.reduce(
      (sum, r) => sum + (r.completed_stops ?? 0),
      0,
    );
    return { total, draft, published, inProgress, completed, totalOrders, completedStops };
  }, [routesData]);

  if (!isSuperAdmin && !selectedOutletId) {
    return (
      <div className="space-y-6">
        <PageHeader
          totalRoutes={undefined}
          dateLabel={selectedDate ? format(selectedDate, 'EEE, dd MMM yyyy') : '—'}
          subtitle="Loading outlet information..."
        />
        <Skeleton className="h-10 w-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        totalRoutes={routesLoading ? undefined : stats.total}
        dateLabel={selectedDate ? format(selectedDate, 'EEE, dd MMM yyyy') : '—'}
        outletName={selectedOutlet?.name}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ListChecks className="h-4 w-4" />}
          label="Total Routes"
          value={routesLoading ? '—' : stats.total.toString()}
          sub={
            stats.total === 0
              ? 'No routes for this date'
              : `${stats.totalOrders} order${stats.totalOrders === 1 ? '' : 's'} planned`
          }
          tone="primary"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Awaiting Start"
          value={routesLoading ? '—' : (stats.draft + stats.published).toString()}
          sub={
            stats.draft + stats.published === 0
              ? 'All routes started'
              : `${stats.draft} draft · ${stats.published} published`
          }
          tone="info"
        />
        <StatCard
          icon={<Truck className="h-4 w-4" />}
          label="In Progress"
          value={routesLoading ? '—' : stats.inProgress.toString()}
          sub={
            stats.inProgress === 0 ? 'None on the road' : 'Currently delivering'
          }
          tone="warning"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={routesLoading ? '—' : stats.completed.toString()}
          sub={
            stats.completed === 0
              ? 'No routes finished yet'
              : `${stats.completedStops} stop${stats.completedStops === 1 ? '' : 's'} delivered`
          }
          tone="success"
        />
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          {canViewAnyOutlet && (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                Outlet
              </span>
              {outletsLoading ? (
                <Skeleton className="h-9 w-[220px]" />
              ) : (
                <Select
                  value={selectedOutletId ?? ''}
                  onValueChange={handleOutletChange}
                >
                  <SelectTrigger className="h-9 w-[220px] gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Select an outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {(outletsData?.data || []).map((outlet) => (
                      <SelectItem key={outlet._id} value={outlet._id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              Date
            </span>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <DatePicker
                date={selectedDate}
                onDateChange={setSelectedDate}
                placeholder="Select date"
                className="h-9 w-[180px]"
              />
            </div>
          </div>

          <div className="ml-auto">
            <Can permission="route:generate">
              <Button
                onClick={handleGenerate}
                disabled={!selectedOutletId || !dateParam || generateRoutes.isPending}
                className="h-9 gap-1.5"
              >
                <Sparkles className="h-4 w-4" />
                {generateRoutes.isPending ? 'Generating...' : 'Generate Routes'}
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>

      <RouteList
        routes={routesData || []}
        outletId={selectedOutletId ?? ''}
        isLoading={routesLoading}
      />
    </div>
  );
}

function PageHeader({
  totalRoutes,
  dateLabel,
  outletName,
  subtitle,
}: {
  totalRoutes?: number;
  dateLabel: string;
  outletName?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Route className="h-4.5 w-4.5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Delivery Routes
          </h1>
          <p className="text-sm text-muted-foreground">
            {subtitle ??
              'Plan, assign, and track delivery routes across outlets and dates.'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {outletName && (
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Building2 className="h-3 w-3" />
            {outletName}
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
        >
          <CalendarDays className="h-3 w-3" />
          {dateLabel}
        </Badge>
        <Badge
          variant="secondary"
          className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
        >
          <Route className="h-3 w-3" />
          {totalRoutes === undefined
            ? 'Loading...'
            : `${totalRoutes} ${totalRoutes === 1 ? 'route' : 'routes'}`}
        </Badge>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'muted';
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
    info: 'bg-info/15 text-info ring-info/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
    muted: 'bg-muted text-muted-foreground ring-border',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
              toneStyles[tone],
            )}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
