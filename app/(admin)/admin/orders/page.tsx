'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Search,
  ShoppingBag,
  CalendarDays,
  Truck,
  CheckCircle2,
  AlertTriangle,
  X as XIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useAdminOrders } from '@/api/hooks/useAdminOrders';
import { UserRole } from '@/api/types/user.types';
import { MealType } from '@/api/types/admin-order.types';
import { OrderTable } from '@/components/admin/orders/OrderTable';
import { OrderDetailModal } from '@/components/admin/orders/OrderDetailModal';
import { UpdateStatusDialog } from '@/components/admin/orders/UpdateStatusDialog';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [mealType, setMealType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [search]);

  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [statusOrderId, setStatusOrderId] = useState<string | null>(null);
  const [statusOrderCurrent, setStatusOrderCurrent] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);

  const isSuperAdmin = user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  const effectiveOutletId = useMemo(() => {
    if (!isSuperAdmin) return user?.assigned_outlet_id || '';
    if (selectedOutletId) return selectedOutletId;
    if (outletsData?.data?.length) return outletsData.data[0]._id;
    return '';
  }, [isSuperAdmin, user?.assigned_outlet_id, selectedOutletId, outletsData?.data]);

  const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;

  const { data, isLoading } = useAdminOrders({
    date: dateParam,
    outlet_id: effectiveOutletId || undefined,
    meal_type: (mealType as MealType) || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
    source: 'daily,addon',
    page,
    limit: 10,
  });

  const orders = data?.data ?? [];

  const stats = useMemo(() => {
    const delivered = orders.filter(
      (o) => o.status === 'delivered' || o.status === 'Delivered',
    ).length;
    const inTransit = orders.filter((o) => o.status === 'out_for_delivery').length;
    const pending = orders.filter(
      (o) =>
        o.status === 'planned' ||
        o.status === 'locked' ||
        o.status === 'Pending' ||
        o.status === 'Confirmed' ||
        o.status === 'Preparing',
    ).length;
    const issues = orders.filter(
      (o) =>
        o.status === 'missed' || o.status === 'cancelled' || o.status === 'Cancelled',
    ).length;
    return { delivered, inTransit, pending, issues };
  }, [orders]);

  const handleOutletChange = useCallback((value: string) => {
    setSelectedOutletId(value === 'all' ? '' : value);
    setPage(1);
  }, []);

  const handleViewDetail = useCallback((id: string) => {
    setDetailOrderId(id);
    setDetailOpen(true);
  }, []);

  const handleUpdateStatus = useCallback((id: string, currentStatus: string) => {
    setStatusOrderId(id);
    setStatusOrderCurrent(currentStatus);
    setStatusOpen(true);
  }, []);

  const isToday = useMemo(() => {
    if (!selectedDate) return false;
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  }, [selectedDate]);

  const activeFilterCount =
    (mealType ? 1 : 0) + (status ? 1 : 0) + (debouncedSearch ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setMealType('');
    setStatus('');
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }, []);

  const total = data?.total ?? 0;

  return (
    <Can
      permission={['order:view:any', 'order:view:outlet']}
      requireAll={false}
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You do not have permission to view orders.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ShoppingBag className="h-4.5 w-4.5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
              <p className="text-sm text-muted-foreground">
                Daily orders and add-on deliveries across outlets.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <ShoppingBag className="h-3 w-3" />
              {total} {total === 1 ? 'order' : 'orders'}
            </Badge>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Total"
            value={`${total}`}
            sub={total === 0 ? 'No orders' : 'Matching filters'}
            tone="primary"
          />
          <StatCard
            icon={<Truck className="h-4 w-4" />}
            label="In Transit"
            value={`${stats.inTransit}`}
            sub={stats.inTransit === 0 ? 'None on this page' : 'Out for delivery'}
            tone="info"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Delivered"
            value={`${stats.delivered}`}
            sub={stats.delivered === 0 ? 'None on this page' : 'Completed'}
            tone="success"
          />
          <StatCard
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Issues"
            value={`${stats.issues}`}
            sub={stats.issues === 0 ? 'All clear' : 'Missed / cancelled'}
            tone="destructive"
          />
        </div>

        {/* Toolbar */}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Date */}
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                  Date
                </span>
                <DatePicker
                  date={selectedDate}
                  onDateChange={(d) => {
                    setSelectedDate(d);
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
                        value={selectedOutletId || 'all'}
                        onValueChange={handleOutletChange}
                      >
                        <SelectTrigger className="h-9 w-[220px] gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <SelectValue placeholder="All Outlets" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Outlets</SelectItem>
                          {(outletsData?.data || []).map((outlet) => (
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
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-3">
              {/* Meal */}
              <Select
                value={mealType || 'all'}
                onValueChange={(v) => {
                  setMealType(v === 'all' ? '' : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meals</SelectItem>
                  <SelectItem value={MealType.BREAKFAST}>Breakfast</SelectItem>
                  <SelectItem value={MealType.LUNCH}>Lunch</SelectItem>
                  <SelectItem value={MealType.DINNER}>Dinner</SelectItem>
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={status || 'all'}
                onValueChange={(v) => {
                  setStatus(v === 'all' ? '' : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[170px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="opted_out">Opted Out</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Preparing">Preparing</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, recipe..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 pl-9"
                />
              </div>

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Clear ({activeFilterCount})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <OrderTable
          data={orders}
          isLoading={isLoading}
          page={page}
          totalPages={data?.totalPages ?? 1}
          total={total}
          onPageChange={setPage}
          onViewDetail={handleViewDetail}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* Modals */}
        <OrderDetailModal orderId={detailOrderId} open={detailOpen} onOpenChange={setDetailOpen} />
        <UpdateStatusDialog
          open={statusOpen}
          onOpenChange={setStatusOpen}
          orderId={statusOrderId}
          currentStatus={statusOrderCurrent}
        />
      </div>
    </Can>
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
