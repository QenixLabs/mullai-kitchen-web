'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Search,
  Plus,
  Eye,
  Pencil,
  ListChecks,
  CheckCircle2,
  Ban,
  ClipboardList,
  Mail,
  Phone,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Can } from '@/components/Auth/can';
import { useSuppliers } from '@/api/hooks/useInventory';
import { cn } from '@/lib/utils';

const LIMIT = 10;

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [search]);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === 'all' ? undefined : status,
      page,
      limit: LIMIT,
    }),
    [debouncedSearch, status, page],
  );

  const { data, isLoading } = useSuppliers(params);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const stats = useMemo(() => {
    const all = data?.data ?? [];
    const totalSuppliers = data?.total ?? 0;
    const active = all.filter((s) => s.status === 'ACTIVE').length;
    const inactive = all.filter((s) => s.status === 'INACTIVE').length;
    const withEmail = all.filter((s) => !!s.email).length;
    return { total: totalSuppliers, active, inactive, withEmail };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Truck className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Suppliers
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage vendors and supplier contacts.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ListChecks className="h-4 w-4" />}
          label="Total Suppliers"
          value={isLoading ? '—' : stats.total.toString()}
          tone="primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Active"
          value={isLoading ? '—' : stats.active.toString()}
          tone="success"
        />
        <StatCard
          icon={<Ban className="h-4 w-4" />}
          label="Inactive"
          value={isLoading ? '—' : stats.inactive.toString()}
          tone="muted"
        />
        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="With Email"
          value={isLoading ? '—' : stats.withEmail.toString()}
          tone="info"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="h-9 w-[220px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              Status
            </span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto">
            <Can permission="supplier:manage">
              <Button asChild className="h-9 gap-1.5">
                <Link href="/admin/inventory/suppliers/create">
                  <Plus className="h-4 w-4" />
                  Add Supplier
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
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  No suppliers found
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or add a new supplier.
                </p>
              </div>
              <Can permission="supplier:manage">
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
                  <Plus className="h-3 w-3" />
                  Add Supplier
                </span>
              </Can>
            </div>
          ) : (
            <TooltipProvider delayDuration={250}>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">
                      Phone
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
                  {rows.map((supplier, idx) => {
                    const isLast = idx === rows.length - 1;
                    return (
                      <TableRow
                        key={supplier._id}
                        className={cn(
                          'group transition-colors hover:bg-accent/20',
                          !isLast && 'border-b border-border/50',
                        )}
                      >
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary ring-1 ring-primary/15">
                              {getInitials(supplier.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {supplier.name}
                              </p>
                              {supplier.contact_person && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {supplier.contact_person}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 md:table-cell">
                          <span className="text-sm text-foreground">
                            {supplier.contact_person || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 lg:table-cell">
                          {supplier.email ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {supplier.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 xl:table-cell">
                          {supplier.phone ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{supplier.phone}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <StatusPill status={supplier.status} />
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
                                    href={`/admin/inventory/suppliers/${supplier._id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">View supplier</p>
                              </TooltipContent>
                            </Tooltip>
                            <Can permission="supplier:manage">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    asChild
                                  >
                                    <Link
                                      href={`/admin/inventory/suppliers/${supplier._id}/edit`}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Edit supplier</p>
                                </TooltipContent>
                              </Tooltip>
                            </Can>
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
                of{' '}
                <span className="font-semibold text-foreground">{total}</span>
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
                supplier{rows.length === 1 ? '' : 's'}
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
          <Truck className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Suppliers
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

function StatusPill({ status }: { status: string }) {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Inactive
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
