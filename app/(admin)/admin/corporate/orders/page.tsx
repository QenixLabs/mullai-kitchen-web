'use client';

import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminCorporateOrders } from '@/api/hooks/useAdminCorporate';
import { CorporateOrderTable } from '@/components/admin/corporate/CorporateOrderTable';
import { CancelOrderDialog } from '@/components/admin/corporate/CancelOrderDialog';
import type { ICorporateOrder } from '@/api/types/corporate.types';

export default function CorporateOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [outletId, setOutletId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [cancelOrder, setCancelOrder] = useState<ICorporateOrder | null>(null);

  const { data, isLoading } = useAdminCorporateOrders({
    search: search || undefined,
    status: status || undefined,
    payment_status: paymentStatus || undefined,
    outlet_id: outletId || undefined,
    page,
    limit: 10,
  });

  const handleCancel = useCallback((order: ICorporateOrder) => {
    setCancelOrder(order);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Corporate Orders</h1>
        <p className="text-sm text-muted-foreground">Manage corporate meal orders</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
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
        <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          placeholder="Date From"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Input
          type="date"
          placeholder="Date To"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      <CorporateOrderTable
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        onCancel={handleCancel}
      />

      <CancelOrderDialog
        orderId={cancelOrder?._id ?? null}
        open={!!cancelOrder}
        onOpenChange={(open) => { if (!open) setCancelOrder(null); }}
      />
    </div>
  );
}
