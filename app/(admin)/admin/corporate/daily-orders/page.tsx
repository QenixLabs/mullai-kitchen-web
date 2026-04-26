'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  useAdminCorporateDailyOrders,
  useAdminCorporateDailyOrdersSummary,
} from '@/api/hooks/useAdminCorporate';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { UserRole } from '@/api/types/user.types';
import { CorporateDailyOrderTable } from '@/components/admin/corporate/CorporateDailyOrderTable';

export default function CorporateDailyOrdersPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const isSuperAdmin =
    user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [outletId, setOutletId] = useState<string>('');
  const [page, setPage] = useState(1);

  const dateStr = date ? date.toISOString().split('T')[0] : undefined;

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

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
          <ClipboardList className="h-3.5 w-3.5" />
          Corporate
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Daily Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage daily corporate meal orders by date and outlet.
        </p>
        <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-gold/50">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <DatePicker
            value={date}
            onChange={(d) => {
              setDate(d);
              setPage(1);
            }}
            placeholder="Select date"
            className="w-44 border-0 bg-transparent focus-visible:ring-0"
          />
        </div>

        <Select
          value={outletId}
          onValueChange={(v) => {
            setOutletId(v === 'all' ? '' : v);
            setPage(1);
          }}
          disabled={!isSuperAdmin && !!user?.assigned_outlet_id}
        >
          <SelectTrigger className="w-56 h-10 rounded-lg border-input bg-card">
            <SelectValue
              placeholder={outletsLoading ? 'Loading outlets...' : 'Select outlet'}
            />
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-4 w-4 text-primary" />}
          label="Total Orders"
          value={ordersLoading || summaryLoading ? '-' : totals.total_orders.toString()}
        />
        <StatCard
          icon={<Salad className="h-4 w-4 text-success" />}
          label="Veg Meals"
          value={ordersLoading || summaryLoading ? '-' : totals.total_veg.toString()}
          color="text-success"
        />
        <StatCard
          icon={<Drumstick className="h-4 w-4 text-destructive" />}
          label="Non-Veg Meals"
          value={ordersLoading || summaryLoading ? '-' : totals.total_nonveg.toString()}
          color="text-destructive"
        />
        <StatCard
          icon={<Utensils className="h-4 w-4 text-gold" />}
          label="Total Meals"
          value={ordersLoading || summaryLoading ? '-' : totals.total_meals.toString()}
          color="text-gold"
        />
      </div>

      <CorporateDailyOrderTable
        data={ordersData?.data ?? []}
        isLoading={ordersLoading}
        page={page}
        totalPages={ordersData?.totalPages ?? 1}
        total={ordersData?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm hover:shadow-primary transition-shadow">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <p className={`text-2xl font-bold leading-none ${color || 'text-foreground'}`}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
