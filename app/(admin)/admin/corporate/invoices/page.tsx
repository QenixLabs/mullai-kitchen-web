'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X as XIcon,
  CalendarDays,
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
import { useAdminCorporateInvoices, useMarkInvoicePaid, useGeneratePaymentLink } from '@/api/hooks/useAdminCorporate';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useHasPermission } from '@/hooks/useHasPermission';
import { CorporateInvoiceTable } from '@/components/admin/corporate/CorporateInvoiceTable';
import { MarkPaidDialog } from '@/components/admin/corporate/MarkPaidDialog';
import { cn } from '@/lib/utils';

export default function CorporateInvoicesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [outletId, setOutletId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canViewAnyOutlet = useHasPermission('outlet:view:any');

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

  const { data, isLoading } = useAdminCorporateInvoices({
    search: debouncedSearch || undefined,
    status: status || undefined,
    type: type || undefined,
    outlet_id: outletId || undefined,
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : undefined,
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : undefined,
    page,
    limit: 10,
  });

  const markPaidMutation = useMarkInvoicePaid();
  const generatePaymentLinkMutation = useGeneratePaymentLink();

  const invoices = data?.data ?? [];
  const total = data?.total ?? 0;

  const stats = useMemo(() => {
    const pending = invoices.filter((i) => i.status === 'pending').length;
    const paid = invoices.filter((i) => i.status === 'paid').length;
    const overdue = invoices.filter((i) => i.status === 'overdue').length;
    return { pending, paid, overdue };
  }, [invoices]);

  const handleMarkPaid = useCallback((id: string) => {
    setSelectedInvoiceId(id);
    setDialogOpen(true);
  }, []);

  const handleGeneratePaymentLink = useCallback((id: string) => {
    generatePaymentLinkMutation.mutate(id);
  }, [generatePaymentLinkMutation]);

  const handleDialogSubmit = (payload: { payment_reference?: string; paid_at?: string }) => {
    if (!selectedInvoiceId) return;
    markPaidMutation.mutate(
      { id: selectedInvoiceId, data: payload },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedInvoiceId(null);
        },
      },
    );
  };

  const activeFilterCount =
    (status ? 1 : 0) +
    (type ? 1 : 0) +
    (outletId ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (debouncedSearch ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setType('');
    setOutletId('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <FileText className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Corporate Invoices</h1>
            <p className="text-sm text-muted-foreground">
              Track corporate billing, payment status, and overdue invoices.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <FileText className="h-3 w-3" />
            {total} {total === 1 ? 'invoice' : 'invoices'}
          </Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Total"
          value={`${total}`}
          sub={total === 0 ? 'No invoices' : 'Matching filters'}
          tone="primary"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Pending"
          value={`${stats.pending}`}
          sub={stats.pending === 0 ? 'None on this page' : 'Awaiting payment'}
          tone="warning"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Paid"
          value={`${stats.paid}`}
          sub={stats.paid === 0 ? 'None on this page' : 'Settled'}
          tone="success"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Overdue"
          value={`${stats.overdue}`}
          sub={stats.overdue === 0 ? 'All on time' : 'Action required'}
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
                  <Select
                    value={outletId || 'all'}
                    onValueChange={(v) => {
                      setOutletId(v === 'all' ? '' : v);
                      setPage(1);
                    }}
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
              <Separator />
            </>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {/* Type */}
            <Select
              value={type || 'all'}
              onValueChange={(v) => {
                setType(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="proforma">Proforma</SelectItem>
                <SelectItem value="cycle">Cycle</SelectItem>
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
              <SelectTrigger className="h-9 w-[160px]">
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

            {/* Date From */}
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <DatePicker
                date={dateFrom}
                onDateChange={(d) => {
                  setDateFrom(d);
                  setPage(1);
                }}
                placeholder="From date"
                className="h-9 w-[150px]"
              />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">to</span>
              <DatePicker
                date={dateTo}
                onDateChange={(d) => {
                  setDateTo(d);
                  setPage(1);
                }}
                placeholder="To date"
                className="h-9 w-[150px]"
              />
            </div>

            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice # or company..."
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
      <CorporateInvoiceTable
        data={invoices}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={total}
        onPageChange={setPage}
        onMarkPaid={handleMarkPaid}
        isMarkingPaid={markPaidMutation.isPending}
        onGeneratePaymentLink={handleGeneratePaymentLink}
        isGeneratingPaymentLink={generatePaymentLinkMutation.isPending}
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
