'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Search,
  ClipboardList,
  CheckCircle2,
  CreditCard,
  XCircle,
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useAdminCorporateOrders } from '@/api/hooks/useAdminCorporate';
import { CorporateOrderTable } from '@/components/admin/corporate/CorporateOrderTable';
import { CancelOrderDialog } from '@/components/admin/corporate/CancelOrderDialog';
import { cn } from '@/lib/utils';
import type { ICorporateOrder } from '@/api/types/corporate.types';

export default function CorporateOrdersPage() {
  const canViewAnyOutlet = useHasPermission('outlet:view:any');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [outletId, setOutletId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [cancelOrder, setCancelOrder] = useState<ICorporateOrder | null>(null);
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

  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  const { data, isLoading } = useAdminCorporateOrders({
    search: debouncedSearch || undefined,
    status: status || undefined,
    payment_status: paymentStatus || undefined,
    outlet_id: outletId || undefined,
    page,
    limit: 10,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status === 'active').length;
    const pendingPayment = orders.filter((o) => o.status === 'pending_payment').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    return { active, pendingPayment, cancelled };
  }, [orders]);

  const handleCancel = useCallback((order: ICorporateOrder) => {
    setCancelOrder(order);
  }, []);

  const handleOutletChange = useCallback((value: string) => {
    setOutletId(value === 'all' ? '' : value);
    setPage(1);
  }, []);

  const activeFilterCount =
    (status ? 1 : 0) +
    (paymentStatus ? 1 : 0) +
    (outletId ? 1 : 0) +
    (debouncedSearch ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setStatus('');
    setPaymentStatus('');
    setOutletId('');
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ClipboardList className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Corporate Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage corporate meal orders and recurring contracts.
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
          icon={<ClipboardList className="h-4 w-4" />}
          label="Total"
          value={`${total}`}
          sub={total === 0 ? 'No orders' : 'Matching filters'}
          tone="primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Active"
          value={`${stats.active}`}
          sub={stats.active === 0 ? 'None on this page' : 'In progress'}
          tone="success"
        />
        <StatCard
          icon={<CreditCard className="h-4 w-4" />}
          label="Pending Payment"
          value={`${stats.pendingPayment}`}
          sub={stats.pendingPayment === 0 ? 'All paid' : 'Awaiting payment'}
          tone="warning"
        />
        <StatCard
          icon={<XCircle className="h-4 w-4" />}
          label="Cancelled"
          value={`${stats.cancelled}`}
          sub={stats.cancelled === 0 ? 'All clear' : 'Cancelled this page'}
          tone="destructive"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 p-4">
          {canViewAnyOutlet && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                  Outlet
                </span>
                {outletsLoading ? (
                  <Skeleton className="h-9 w-[220px]" />
                ) : (
                  <Select value={outletId || 'all'} onValueChange={handleOutletChange}>
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
              <Separator />
            </>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {/* Status */}
            <Select
              value={status || 'all'}
              onValueChange={(v) => {
                setStatus(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status */}
            <Select
              value={paymentStatus || 'all'}
              onValueChange={(v) => {
                setPaymentStatus(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[170px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, company..."
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
      <CorporateOrderTable
        data={orders}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={total}
        onPageChange={setPage}
        onCancel={handleCancel}
      />

      <CancelOrderDialog
        orderId={cancelOrder?._id ?? null}
        open={!!cancelOrder}
        onOpenChange={(open) => {
          if (!open) setCancelOrder(null);
        }}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'warning' | 'destructive';
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
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
