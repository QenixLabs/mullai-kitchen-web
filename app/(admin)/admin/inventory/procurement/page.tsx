'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Plus,
  Building2,
  Truck,
  SlidersHorizontal,
  ListChecks,
  Clock,
  CheckCircle2,
  Ban,
  Eye,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Can } from '@/components/Auth/can';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useSuppliers, usePurchaseOrders } from '@/api/hooks/useInventory';
import { UserRole } from '@/api/types/user.types';
import { cn } from '@/lib/utils';

const LIMIT = 10;

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ProcurementPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );
  const { data: suppliersData } = useSuppliers({ limit: 100 });

  const isSuperAdmin =
    user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

  useEffect(() => {
    if (canViewAnyOutlet && !selectedOutletId && outletsData?.data?.length) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [canViewAnyOutlet, selectedOutletId, outletsData?.data]);

  const params = useMemo(
    () => ({
      outlet_id: selectedOutletId ?? undefined,
      supplier_id: supplierId === 'all' ? undefined : supplierId,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      limit: LIMIT,
    }),
    [selectedOutletId, supplierId, statusFilter, page],
  );

  const { data, isLoading } = usePurchaseOrders(params);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const stats = useMemo(() => {
    const all = data?.data ?? [];
    const totalPOs = all.length;
    const totalValue = all.reduce((s, po) => s + (po.total_amount ?? 0), 0);
    const avgValue = totalPOs > 0 ? Math.round(totalValue / totalPOs) : 0;
    const pending = all.filter(
      (po) => po.status === 'PENDING' || po.status === 'PARTIAL',
    ).length;
    return { total: totalPOs, totalValue, avgValue, pending };
  }, [data]);

  const selectedOutlet = useMemo(
    () => outletsData?.data?.find((o) => o._id === selectedOutletId),
    [outletsData?.data, selectedOutletId],
  );

  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ClipboardList className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Purchase Orders
            </h1>
            <p className="text-sm text-muted-foreground">
              Track procurement from draft to receipt.
            </p>
          </div>
        </div>
        {selectedOutlet && (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {selectedOutlet.name}
          </span>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ListChecks className="h-4 w-4" />}
          label="Total POs"
          value={isLoading ? '—' : stats.total.toString()}
          tone="primary"
        />
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Total Value"
          value={isLoading ? '—' : formatCurrency(stats.totalValue)}
          tone="info"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Pending"
          value={isLoading ? '—' : stats.pending.toString()}
          tone="warning"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Avg Value"
          value={isLoading ? '—' : formatCurrency(stats.avgValue)}
          tone="success"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          {canViewAnyOutlet && (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                Outlet
              </span>
              {outletsLoading ? (
                <Skeleton className="h-9 w-[220px]" />
              ) : (
                <Select
                  value={selectedOutletId ?? ''}
                  onValueChange={setSelectedOutletId}
                >
                  <SelectTrigger className="h-9 w-[220px] gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Select an outlet" />
                  </SelectTrigger>
                  <SelectContent>
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

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              Supplier
            </span>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="h-9 w-[200px] gap-2">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All suppliers</SelectItem>
                {(suppliersData?.data ?? []).map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              Status
            </span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[160px]">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto">
            <Can permission="inventory:procurement">
              <Button asChild className="h-9 gap-1.5">
                <Link href="/admin/inventory/procurement/create">
                  <Plus className="h-4 w-4" />
                  Create PO
                </Link>
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>

      {/* Content Card */}
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={rows.length} total={total} />

          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  No purchase orders
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust filters or create a new purchase order.
                </p>
              </div>
              <Can permission="inventory:procurement">
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
                  <Plus className="h-3 w-3" />
                  Create PO
                </span>
              </Can>
            </div>
          ) : (
            <TooltipProvider delayDuration={250}>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      PO ID
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Supplier
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                      Order Date
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                      Expected Delivery
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Total
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-10 w-24 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((po, idx) => {
                    const isLast = idx === rows.length - 1;
                    return (
                      <TableRow
                        key={po._id}
                        className={cn(
                          'group transition-colors hover:bg-accent/20',
                          !isLast && 'border-b border-border/50',
                        )}
                      >
                        <TableCell className="px-4 py-3">
                          <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                            {po._id.slice(-6).toUpperCase()}
                          </code>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-sm font-medium text-foreground">
                            {po.supplier_id && typeof po.supplier_id === 'object'
                              ? (po.supplier_id as any).name
                              : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 md:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {po.order_date
                              ? format(new Date(po.order_date), 'dd MMM yyyy')
                              : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {po.expected_delivery_date
                              ? format(new Date(po.expected_delivery_date), 'dd MMM yyyy')
                              : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(po.total_amount ?? 0)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <POStatusPill status={po.status} />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  asChild
                                >
                                  <Link
                                    href={`/admin/inventory/procurement/${po._id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">View PO</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          )}

          {totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
              <span>
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}
                </span>{' '}
                of <span className="font-semibold text-foreground">{total}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">
                  {rows.length}
                </span>{' '}
                PO{rows.length === 1 ? '' : 's'}
                {total > 0 && total !== rows.length && (
                  <>
                    {' '}
                    · <span className="font-semibold text-foreground">{total}</span> total
                  </>
                )}
              </span>
              <span className="hidden sm:inline">Click eye icon to view</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HeaderStrip({ count, total }: { count: number; total?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <ClipboardList className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Purchase Orders
        </h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
}

function POStatusPill({ status }: { status: string }) {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'DRAFT') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        Draft
      </span>
    );
  }
  if (normalized === 'PUBLISHED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-info/20 bg-info/10 px-2.5 py-0.5 text-xs font-medium text-info">
        <span className="h-1.5 w-1.5 rounded-full bg-info" />
        Published
      </span>
    );
  }
  if (normalized === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        In Progress
      </span>
    );
  }
  if (normalized === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
      Cancelled
    </span>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'muted';
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
    info: 'bg-info/15 text-info ring-info/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
    muted: 'bg-muted text-muted-foreground ring-border',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
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
