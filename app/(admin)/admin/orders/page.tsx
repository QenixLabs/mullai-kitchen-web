'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Building2, Search } from 'lucide-react';
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

  // Debounce search input by 300ms
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

  // For non-super-admin users, pre-select their assigned outlet
  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

  // Auto-select first outlet for admin/super-admin when list loads
  useEffect(() => {
    if (isSuperAdmin && !selectedOutletId && outletsData?.data?.length) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [isSuperAdmin, selectedOutletId, outletsData?.data?.length]);

  const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;

  const { data, isLoading } = useAdminOrders({
    date: dateParam,
    outlet_id: selectedOutletId || undefined,
    meal_type: (mealType as MealType) || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });

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

  return (
    <Can
      permission={['order:view:any', 'order:view:outlet']}
      requireAll={false}
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground">You do not have permission to view orders.</p>
          </div>
        </div>
      }
    >
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">
          View and manage daily orders and add-on order deliveries.
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Date Picker */}
        <DatePicker
          date={selectedDate}
          onDateChange={(d) => {
            setSelectedDate(d);
            setPage(1);
          }}
          placeholder="Select date"
          className="w-56"
        />

        {/* Outlet Selector - only for admin/super-admin */}
        {canViewAnyOutlet && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {outletsLoading ? (
              <Skeleton className="h-10 w-56" />
            ) : (
              <Select value={selectedOutletId} onValueChange={handleOutletChange}>
                <SelectTrigger className="w-56">
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
        )}

        {/* Meal Type Select */}
        <Select
          value={mealType}
          onValueChange={(v) => {
            setMealType(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Meal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Meals</SelectItem>
            <SelectItem value={MealType.BREAKFAST}>Breakfast</SelectItem>
            <SelectItem value={MealType.LUNCH}>Lunch</SelectItem>
            <SelectItem value={MealType.DINNER}>Dinner</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Order Table */}
      <OrderTable
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        onViewDetail={handleViewDetail}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Modals */}
      <OrderDetailModal
        orderId={detailOrderId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

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
