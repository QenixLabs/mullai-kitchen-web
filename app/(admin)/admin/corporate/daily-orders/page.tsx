'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CalendarDays,
  Building2,
  Salad,
  Drumstick,
  Utensils,
  ClipboardList,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  useAdminCorporateDailyOrders,
  useAdminCorporateDailyOrdersSummary,
} from '@/api/hooks/useAdminCorporate';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { UserRole } from '@/api/types/user.types';
import { CorporateDailyOrderTable } from '@/components/admin/corporate/CorporateDailyOrderTable';
import { cn } from '@/lib/utils';

export default function CorporateDailyOrdersPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const isSuperAdmin =
    user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [outletId, setOutletId] = useState<string>('');
  const [page, setPage] = useState(1);

  const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;

  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setOutletId(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

  const { data: summaryData, isLoading: summaryLoading } =
    useAdminCorporateDailyOrdersSummary({
      date: dateStr,
      outlet_id: outletId || undefined,
    });

  const { data: ordersData, isLoading: ordersLoading } =
    useAdminCorporateDailyOrders({
      date: dateStr,
      outlet_id: outletId || undefined,
      page,
      limit: 10,
    });

  const summaries = summaryData?.summaries ?? [];
  const orders = ordersData?.data ?? [];
  const total = ordersData?.total ?? 0;

  const totals = useMemo(() => {
    if (summaries.length > 0) {
      return summaries.reduce(
        (acc, s) => ({
          total_orders: acc.total_orders + (s.total_orders || 0),
          total_veg: acc.total_veg + (s.veg_meals || 0),
          total_nonveg: acc.total_nonveg + (s.nonveg_meals || 0),
          total_meals: acc.total_meals + (s.total_meals || 0),
        }),
        { total_orders: 0, total_veg: 0, total_nonveg: 0, total_meals: 0 },
      );
    }
    // Fallback: compute from visible table data
    return orders.reduce(
      (acc, o) => ({
        total_orders: acc.total_orders + 1,
        total_veg: acc.total_veg + (o.veg_count || 0),
        total_nonveg: acc.total_nonveg + (o.nonveg_count || 0),
        total_meals: acc.total_meals + (o.total_meals || 0),
      }),
      { total_orders: 0, total_veg: 0, total_nonveg: 0, total_meals: 0 },
    );
  }, [summaries, orders]);

  const isLoadingStats = ordersLoading || summaryLoading;

  const isToday = useMemo(() => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }, [date]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ClipboardList className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Orders</h1>
            <p className="text-sm text-muted-foreground">
              Daily corporate meal deliveries by date and outlet.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <ClipboardList className="h-3 w-3" />
            {total} {total === 1 ? 'order' : 'orders'}
          </Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Total Orders"
          value={isLoadingStats ? '—' : totals.total_orders.toString()}
          sub={isLoadingStats ? 'Loading' : 'Across selected scope'}
          tone="primary"
        />
        <StatCard
          icon={<Salad className="h-4 w-4" />}
          label="Veg Meals"
          value={isLoadingStats ? '—' : totals.total_veg.toString()}
          sub={isLoadingStats ? 'Loading' : 'Vegetarian portions'}
          tone="success"
        />
        <StatCard
          icon={<Drumstick className="h-4 w-4" />}
          label="Non-Veg Meals"
          value={isLoadingStats ? '—' : totals.total_nonveg.toString()}
          sub={isLoadingStats ? 'Loading' : 'Non-vegetarian portions'}
          tone="destructive"
        />
        <StatCard
          icon={<Utensils className="h-4 w-4" />}
          label="Total Meals"
          value={isLoadingStats ? '—' : totals.total_meals.toString()}
          sub={isLoadingStats ? 'Loading' : 'All portions combined'}
          tone="info"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          {/* Date */}
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              Date
            </span>
            <DatePicker
              date={date}
              onDateChange={(d) => {
                setDate(d);
                setPage(1);
              }}
              placeholder="Select date"
              className="h-9 w-[200px]"
            />
            {isToday && (
              <Badge
                variant="secondary"
                className="h-5 border-0 bg-primary/10 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
              >
                <CalendarDays className="mr-1 h-3 w-3" />
                Today
              </Badge>
            )}
          </div>

          {/* Outlet */}
          {canViewAnyOutlet && (
            <>
              <Separator orientation="vertical" className="hidden h-9 lg:block" />
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                  Outlet
                </span>
                {outletsLoading ? (
                  <Skeleton className="h-9 w-[220px]" />
                ) : (
                  <Select
                    value={outletId || 'all'}
                    onValueChange={(v) => {
                      setOutletId(v === 'all' ? '' : v);
                      setPage(1);
                    }}
                    disabled={!isSuperAdmin && !!user?.assigned_outlet_id}
                  >
                    <SelectTrigger className="h-9 w-[220px] gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="All Outlets" />
                    </SelectTrigger>
                    <SelectContent>
                      {isSuperAdmin && <SelectItem value="all">All Outlets</SelectItem>}
                      {outletsData?.data?.map((outlet) => (
                        <SelectItem key={outlet._id} value={outlet._id}>
                          {outlet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <CorporateDailyOrderTable
        data={orders}
        isLoading={ordersLoading}
        page={page}
        totalPages={ordersData?.totalPages ?? 1}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'info' | 'success' | 'destructive';
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    info: 'bg-info/15 text-info ring-info/20',
    success: 'bg-success/15 text-success ring-success/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
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
