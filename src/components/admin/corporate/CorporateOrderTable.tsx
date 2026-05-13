'use client';

import Link from 'next/link';
import {
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Building2,
  Users,
  CalendarDays,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { cn } from '@/lib/utils';
import type { ICorporateOrder } from '@/api/types/corporate.types';

interface CorporateOrderTableProps {
  data: ICorporateOrder[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  onCancel: (order: ICorporateOrder) => void;
}

const orderStatusClass: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground border-secondary/30',
  pending_payment: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const paymentStatusClass: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function HeaderStrip({ count, total }: { count: number; total?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <ClipboardList className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Corporate Orders</h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
}

export function CorporateOrderTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onCancel,
}: CorporateOrderTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={0} />
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={total ?? 0} />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No orders found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting the search, status, or outlet filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total ?? data.length);

  return (
    <TooltipProvider delayDuration={250}>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={data.length} total={total} />
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Order ID
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  Company
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Outlet
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">
                  Period
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Headcount
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Payment
                </TableHead>
                <TableHead className="h-10 w-24 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((order, idx) => {
                const isLast = idx === data.length - 1;
                const startDate = new Date(order.start_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                });
                const endDate = new Date(order.end_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <TableRow
                    key={order._id}
                    className={cn(
                      'group transition-colors hover:bg-accent/20',
                      !isLast && 'border-b border-border/50',
                    )}
                  >
                    <TableCell className="px-4 py-3">
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                        {order.order_id}
                      </code>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary ring-1 ring-primary/15">
                          {getInitials(order.company_name)}
                        </span>
                        <p className="truncate text-sm font-semibold text-foreground">
                          {order.company_name || '—'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{order.outlet_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 xl:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        <span>{startDate} – {endDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 text-right lg:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {order.headcount}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusPill className={orderStatusClass[order.status]}>
                        {order.status.replace(/_/g, ' ')}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 sm:table-cell">
                      <StatusPill className={paymentStatusClass[order.payment_status]}>
                        {order.payment_status}
                      </StatusPill>
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
                              <Link href={`/admin/corporate/orders/${order._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">View details</p>
                          </TooltipContent>
                        </Tooltip>
                        <Can permission="corporate:modify">
                          {(order.status === 'active' ||
                            order.status === 'pending_payment' ||
                            order.status === 'draft') && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => onCancel(order)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Cancel order</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
              <span>
                Showing <span className="font-semibold text-foreground">{start}–{end}</span> of{' '}
                <span className="font-semibold text-foreground">{total ?? data.length}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  const near = Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
                  if (!near) {
                    if (p === page - 2 || p === page + 2)
                      return (
                        <span key={p} className="px-1 text-xs text-muted-foreground">
                          …
                        </span>
                      );
                    return null;
                  }
                  return (
                    <Button
                      key={p}
                      variant={page === p ? 'default' : 'outline'}
                      size="icon-sm"
                      onClick={() => onPageChange(p)}
                      className={cn(
                        'text-xs',
                        page === p && 'bg-primary text-primary-foreground hover:bg-primary/90',
                      )}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{data.length}</span> order
                {data.length === 1 ? '' : 's'}
                {total !== undefined && total !== data.length && (
                  <>
                    {' '}
                    · <span className="font-semibold text-foreground">{total}</span> total
                  </>
                )}
              </span>
              <span className="hidden sm:inline">Click row icons to view or cancel</span>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function StatusPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        className,
      )}
    >
      {children}
    </span>
  );
}
