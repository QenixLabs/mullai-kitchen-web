'use client';

import { useState } from 'react';
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
import { useAdminCorporateInvoices, useMarkInvoicePaid } from '@/api/hooks/useAdminCorporate';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useHasPermission } from '@/hooks/useHasPermission';
import { CorporateInvoiceTable } from '@/components/admin/corporate/CorporateInvoiceTable';
import { MarkPaidDialog } from '@/components/admin/corporate/MarkPaidDialog';

export default function CorporateInvoicesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [outletId, setOutletId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canViewAnyOutlet = useHasPermission('outlet:view:any');

  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  const { data, isLoading } = useAdminCorporateInvoices({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
    outlet_id: outletId || undefined,
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : undefined,
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : undefined,
    page,
    limit: 10,
  });

  const markPaidMutation = useMarkInvoicePaid();

  const handleMarkPaid = (id: string) => {
    setSelectedInvoiceId(id);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (data: { payment_reference?: string; paid_at?: string }) => {
    if (!selectedInvoiceId) return;
    markPaidMutation.mutate(
      { id: selectedInvoiceId, data },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedInvoiceId(null);
        },
      },
    );
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setOutletId('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Corporate Invoices</h1>
        <p className="text-sm text-muted-foreground">Manage corporate billing and invoices</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice # or company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>

        {canViewAnyOutlet && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {outletsLoading ? (
              <Skeleton className="h-10 w-56" />
            ) : (
              <Select value={outletId || 'all'} onValueChange={(v) => { setOutletId(v === 'all' ? '' : v); setPage(1); }}>
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

        <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type || 'all'} onValueChange={(v) => { setType(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="proforma">Proforma</SelectItem>
            <SelectItem value="cycle">Cycle</SelectItem>
          </SelectContent>
        </Select>

        <DatePicker
          value={dateFrom}
          onChange={(d) => { setDateFrom(d); setPage(1); }}
          placeholder="From date"
          className="w-40"
        />

        <DatePicker
          value={dateTo}
          onChange={(d) => { setDateTo(d); setPage(1); }}
          placeholder="To date"
          className="w-40"
        />

        <button
          onClick={resetFilters}
          className="text-sm text-primary hover:underline"
        >
          Reset
        </button>
      </div>

      <CorporateInvoiceTable
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        onMarkPaid={handleMarkPaid}
        isMarkingPaid={markPaidMutation.isPending}
      />

      <MarkPaidDialog
        invoiceId={selectedInvoiceId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleDialogSubmit}
        isSubmitting={markPaidMutation.isPending}
      />
    </div>
  );
}
