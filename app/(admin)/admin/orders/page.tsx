'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Search,
<<<<<<< HEAD
  ListFilter,
  ClipboardList,
  PackageOpen,
  Bike,
  IndianRupee,
=======
  X,
>>>>>>> 831ebf2 (admin pages ui changes)
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
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Can } from '@/components/Auth/can';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
import { BentoStatsCard } from '@/components/admin/layout/BentoStatsCard';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useAdminOrders } from '@/api/hooks/useAdminOrders';
import { UserRole } from '@/api/types/user.types';
import { MealType, type UnifiedOrder } from '@/api/types/admin-order.types';
import { OrderCard } from '@/components/admin/orders/OrderCard';
import { OrderDetailModal } from '@/components/admin/orders/OrderDetailModal';
import { UpdateStatusDialog } from '@/components/admin/orders/UpdateStatusDialog';

// Static mock data for UI preview
const MOCK_ORDERS: Array<UnifiedOrder & { outlet_name?: string }> = [
  {
    _id: 'ord-001',
    source: 'daily',
    customer_name: 'Rahul Sharma',
    meal_type: MealType.BREAKFAST,
    recipe_name: 'Idli Sambar',
    status: 'delivered',
    full_address: '42, Gandhi Nagar, Koramangala, Bangalore - 560034',
    delivery_route_id: 'route-a',
    route_sequence: 1,
    delivery_time: '08:30 AM',
    created_at: '2026-04-21T06:00:00Z',
    updated_at: '2026-04-21T08:35:00Z',
    outlet_name: 'Chennai Central',
  },
  {
    _id: 'ord-002',
    source: 'daily',
    customer_name: 'Priya Patel',
    meal_type: MealType.LUNCH,
    recipe_name: 'Veg Thali',
    status: 'out_for_delivery',
    full_address: '15, 2nd Main, Indiranagar, Bangalore - 560038',
    delivery_route_id: 'route-a',
    route_sequence: 2,
    delivery_time: '12:30 PM',
    created_at: '2026-04-21T06:00:00Z',
    updated_at: '2026-04-21T12:15:00Z',
    outlet_name: 'Anna Nagar',
  },
  {
    _id: 'ord-003',
    source: 'addon',
    customer_name: 'Ananya Gupta',
    meal_type: MealType.DINNER,
    items: [
      { name: 'Paneer Butter Masala', quantity: 1 },
      { name: 'Butter Naan', quantity: 2 },
    ],
    status: 'Preparing',
    delivery_address: {
      address_line: '78, 4th Cross',
      area: 'HSR Layout',
      city: 'Bangalore',
      pincode: '560102',
    },
    delivery_time: '07:30 PM',
    created_at: '2026-04-21T10:00:00Z',
    updated_at: '2026-04-21T16:00:00Z',
    outlet_name: 'Chennai Central',
  },
  {
    _id: 'ord-004',
    source: 'daily',
    customer_name: 'Vikram Rao',
    meal_type: MealType.LUNCH,
    recipe_name: 'Chicken Biryani',
    status: 'locked',
    full_address: '21, Church Street, MG Road, Bangalore - 560001',
    delivery_route_id: 'route-b',
    route_sequence: 1,
    delivery_time: '12:45 PM',
    created_at: '2026-04-21T06:00:00Z',
    updated_at: '2026-04-21T09:00:00Z',
    outlet_name: 'Adyar Estate',
  },
  {
    _id: 'ord-005',
    source: 'daily',
    customer_name: 'Sneha Iyer',
    meal_type: MealType.BREAKFAST,
    recipe_name: 'Masala Dosa',
    status: 'planned',
    full_address: '56, 1st Block, Jayanagar, Bangalore - 560011',
    delivery_route_id: 'route-c',
    route_sequence: 3,
    delivery_time: '08:15 AM',
    created_at: '2026-04-21T06:00:00Z',
    updated_at: '2026-04-21T06:00:00Z',
    outlet_name: 'Anna Nagar',
  },
  {
    _id: 'ord-006',
    source: 'addon',
    customer_name: 'Arjun Nair',
    meal_type: MealType.DINNER,
    items: [
      { name: 'Fish Curry', quantity: 1 },
      { name: 'Kerala Parotta', quantity: 3 },
    ],
    status: 'Confirmed',
    delivery_address: {
      address_line: '33, 5th Phase',
      area: 'JP Nagar',
      city: 'Bangalore',
      pincode: '560078',
    },
    delivery_time: '08:00 PM',
    created_at: '2026-04-21T11:00:00Z',
    updated_at: '2026-04-21T14:00:00Z',
    outlet_name: 'Chennai Central',
  },
  {
    _id: 'ord-007',
    source: 'daily',
    customer_name: 'Meera Krishnan',
    meal_type: MealType.LUNCH,
    recipe_name: 'Veg Biryani',
    status: 'missed',
    full_address: '89, 3rd Stage, Basaveshwaranagar, Bangalore - 560079',
    delivery_route_id: 'route-b',
    route_sequence: 4,
    delivery_time: '01:00 PM',
    created_at: '2026-04-21T06:00:00Z',
    updated_at: '2026-04-21T13:30:00Z',
    outlet_name: 'Adyar Estate',
  },
  {
    _id: 'ord-008',
    source: 'daily',
    customer_name: 'Karthik Reddy',
    meal_type: MealType.DINNER,
    recipe_name: 'Roti & Dal',
    status: 'paused',
    full_address: '12, 6th Cross, Malleswaram, Bangalore - 560003',
    delivery_route_id: 'route-d',
    route_sequence: 2,
    delivery_time: '07:45 PM',
    created_at: '2026-04-21T06:00:00Z',
    updated_at: '2026-04-21T06:00:00Z',
    outlet_name: 'Chennai Central',
  },
];

export default function OrdersPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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

  const isSuperAdmin =
    user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined
  );

  // For non-super-admin users, pre-select their assigned outlet
  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

<<<<<<< HEAD
  // Auto-select first outlet for admin/super-admin when list loads
  useEffect(() => {
    if (isSuperAdmin && !selectedOutletId && outletsData?.data?.length) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [isSuperAdmin, selectedOutletId, outletsData?.data?.length]);

  const dateParam = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : undefined;
=======
  const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
>>>>>>> 831ebf2 (admin pages ui changes)

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

<<<<<<< HEAD
  const displayOrders = data?.data?.length
    ? data.data.map((o) => ({
        ...o,
        outlet_name:
          outletsData?.data?.find((out) => out._id === selectedOutletId)
            ?.name || 'Central Kitchen',
      }))
    : MOCK_ORDERS;
=======
  const handleClearFilters = useCallback(() => {
    setSelectedDate(undefined);
    setMealType('');
    setStatus('');
    setSearch('');
    setDebouncedSearch('');
    if (isSuperAdmin) setSelectedOutletId('');
    setPage(1);
  }, [isSuperAdmin]);

  const activeFilters = [
    selectedDate && { label: format(selectedDate, 'MMM d, yyyy'), onRemove: () => setSelectedDate(undefined) },
    mealType && { label: mealType, onRemove: () => setMealType('') },
    status && { label: status.replace(/_/g, ' '), onRemove: () => setStatus('') },
    search && { label: `Search: "${search}"`, onRemove: () => { setSearch(''); setDebouncedSearch(''); } },
  ].filter(Boolean) as { label: string; onRemove: () => void }[];
>>>>>>> 831ebf2 (admin pages ui changes)

  return (
    <Can
      permission={['order:view:any', 'order:view:outlet']}
      requireAll={false}
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-[#3d000c]">
              Access Denied
            </h2>
            <p className="text-sm text-[#554243]">
              You do not have permission to view orders.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <AdminPageHeader
          title="GLOBAL ORDERS"
          subtitle="Real-time oversight across all premium culinary hubs."
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BentoStatsCard
            label="TOTAL GLOBAL ORDERS"
            value="1,284"
            subtitle="+12%"
            icon={ClipboardList}
          />
          <BentoStatsCard
            label="PENDING DISPATCH"
            value="42"
            subtitle=""
            icon={PackageOpen}
          />
          <BentoStatsCard
            label="ACTIVE DELIVERIES"
            value="156"
            subtitle=""
            icon={Bike}
          />
          <BentoStatsCard
            label="REVENUE (TODAY)"
            value="₹4.2L"
            subtitle=""
            icon={IndianRupee}
          />
        </div>

        {/* Filters Row */}
        <div
          className="flex flex-col gap-3 rounded-3xl border p-4 sm:flex-row sm:flex-wrap sm:items-center"
          style={{
            borderColor: 'rgba(219,192,193,0.2)',
            backgroundColor: 'rgba(255,255,255,0.6)',
          }}
        >
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide shrink-0" style={{ color: '#554243' }}>
            <ListFilter className="h-4 w-4" />
            FILTERS
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Outlet Selector */}
            {canViewAnyOutlet && (
              <>
                {outletsLoading ? (
                  <Skeleton className="h-10 w-full sm:w-40" />
                ) : (
                  <Select value={selectedOutletId} onValueChange={handleOutletChange}>
                    <SelectTrigger
                      className="w-full rounded-3xl border-[rgba(219,192,193,0.3)] bg-white text-sm sm:w-40"
                    >
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
              </>
            )}

            {/* Meal Type Select */}
            <Select
              value={mealType}
              onValueChange={(v) => {
                setMealType(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full rounded-3xl border-[rgba(219,192,193,0.3)] bg-white text-sm sm:w-40">
                <SelectValue placeholder="All Meal Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meal Types</SelectItem>
                <SelectItem value={MealType.BREAKFAST}>Breakfast</SelectItem>
                <SelectItem value={MealType.LUNCH}>Lunch</SelectItem>
                <SelectItem value={MealType.DINNER}>Dinner</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Picker styled as select */}
            <DatePicker
              date={selectedDate}
              onDateChange={(d) => {
                setSelectedDate(d);
                setPage(1);
              }}
              placeholder="Time Window: Now"
              className="w-full rounded-3xl border border-[rgba(219,192,193,0.3)] bg-white text-sm sm:w-48"
            />

            {/* Status Select */}
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full rounded-3xl border-[rgba(219,192,193,0.3)] bg-white text-sm sm:w-36">
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
            <div className="relative w-full min-w-0 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#554243]" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 rounded-3xl border-[rgba(219,192,193,0.3)] bg-white text-sm"
              />
            </div>

            {/* Apply Filter Button */}
            <Button
              className="w-full rounded-full px-6 text-sm font-semibold sm:w-auto"
              style={{ backgroundColor: '#44151c', color: '#fff' }}
              onClick={() => setPage(1)}
            >
              Apply Filter
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {activeFilters.map((f, i) => (
              <button
                key={i}
                onClick={f.onRemove}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                {f.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Order Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white p-5"
                style={{ border: '1px solid rgba(219,192,193,0.2)' }}
              >
                <div className="flex items-start justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="mt-3 h-6 w-40" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="mt-4 flex gap-3">
                  <Skeleton className="h-10 flex-1 rounded-full" />
                  <Skeleton className="h-10 flex-1 rounded-full" />
                </div>
              </div>
            ))}
          </div>
<<<<<<< HEAD
=======
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-border/40 shadow-sm p-12 text-center">
            <Truck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No orders found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeFilters.length > 0
                ? 'No orders match your current filters.'
                : 'There are no orders in the system yet.'}
            </p>
            {activeFilters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="rounded-full h-9 px-4"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Clear all filters
              </Button>
            )}
          </div>
>>>>>>> 831ebf2 (admin pages ui changes)
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {displayOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewDetail={handleViewDetail}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {(data?.totalPages ?? 1) > 1 && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm" style={{ color: '#554243' }}>
              Page {page} of {data?.totalPages ?? 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-3xl border-[rgba(219,192,193,0.3)]"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (data?.totalPages ?? 1)}
                onClick={() => setPage(page + 1)}
                className="rounded-3xl border-[rgba(219,192,193,0.3)]"
              >
                Next
              </Button>
            </div>
          </div>
        )}

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
