'use client';

import { useState, useMemo, useEffect } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const isSuperAdmin = user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [outletId, setOutletId] = useState<string>('');
  const [page, setPage] = useState(1);

  const dateStr = date ? date.toISOString().split('T')[0] : undefined;

  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  // Pre-select assigned outlet for non-admin users
  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setOutletId(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

  const { data: summaryData, isLoading: summaryLoading } = useAdminCorporateDailyOrdersSummary({
    date: dateStr,
    outlet_id: outletId || undefined,
  });

  const { data: ordersData, isLoading: ordersLoading } = useAdminCorporateDailyOrders({
    date: dateStr,
    outlet_id: outletId || undefined,
    page,
    limit: 10,
  });

  const summaries = summaryData?.summaries ?? [];

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, s) => ({
        total_orders: acc.total_orders + (s.total_orders || 0),
        total_veg: acc.total_veg + (s.veg_meals || 0),
        total_nonveg: acc.total_nonveg + (s.nonveg_meals || 0),
        total_meals: acc.total_meals + (s.total_meals || 0),
      }),
      { total_orders: 0, total_veg: 0, total_nonveg: 0, total_meals: 0 }
    );
  }, [summaries]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Corporate Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage daily corporate meal orders</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DatePicker
          value={date}
          onChange={(d) => { setDate(d); setPage(1); }}
          placeholder="Select date"
          className="w-48"
        />

        <Select
          value={outletId}
          onValueChange={(v) => { setOutletId(v === 'all' ? '' : v); setPage(1); }}
          disabled={!isSuperAdmin && !!user?.assigned_outlet_id}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder={outletsLoading ? 'Loading outlets...' : 'Select outlet'} />
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Corporate Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : totals.total_orders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Veg Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summaryLoading ? '...' : totals.total_veg}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Non-Veg Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {summaryLoading ? '...' : totals.total_nonveg}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {summaryLoading ? '...' : totals.total_meals}
            </div>
          </CardContent>
        </Card>
      </div>

      <CorporateDailyOrderTable
        data={ordersData?.data ?? []}
        isLoading={ordersLoading}
        page={page}
        totalPages={ordersData?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
