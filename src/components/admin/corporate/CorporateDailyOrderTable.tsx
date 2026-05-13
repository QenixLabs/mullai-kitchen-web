'use client';

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MapPin,
  Leaf,
  Drumstick,
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
import { cn } from '@/lib/utils';
import type { ICorporateDailyOrder } from '@/api/types/corporate.types';

interface CorporateDailyOrderTableProps {
  data: ICorporateDailyOrder[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}

const statusClass: Record<string, string> = {
  planned: 'bg-secondary text-secondary-foreground border-secondary/30',
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-info/10 text-info border-info/20',
  preparing: 'bg-primary/10 text-primary border-primary/20',
  ready: 'bg-success/10 text-success border-success/20',
  out_for_delivery: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
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
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Daily Orders</h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
}

export function CorporateDailyOrderTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
}: CorporateDailyOrderTableProps) {
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
              <h3 className="text-base font-semibold text-foreground">No daily orders</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No corporate daily orders for the selected date and outlet.
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
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Date
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Order ID
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  Company
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Veg
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Non-Veg
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Address
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((order, idx) => {
                const isLast = idx === data.length - 1;
                const address = order.delivery_address?.address_line || '—';
                return (
                  <TableRow
                    key={order._id}
                    className={cn(
                      'group transition-colors hover:bg-accent/20',
                      !isLast && 'border-b border-border/50',
                    )}
                  >
                    <TableCell className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                      {new Date(order.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
                        {order.order_id || order.corporate_order_id}
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
                    <TableCell className="px-4 py-3 text-right">
                      {order.veg_count > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-success ring-1 ring-success/20">
                          <Leaf className="h-3 w-3" />
                          {order.veg_count}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground tabular-nums">0</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {order.nonveg_count > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-rose-600 ring-1 ring-rose-100">
                          <Drumstick className="h-3 w-3" />
                          {order.nonveg_count}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground tabular-nums">0</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <span className="text-sm font-bold tabular-nums text-foreground">
                        {order.total_meals}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusPill className={statusClass[order.status]}>
                        {order.status.replace(/_/g, ' ')}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="hidden max-w-[220px] px-4 py-3 lg:table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{address}</span>
                          </div>
                        </TooltipTrigger>
                        {address !== '—' && (
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">{address}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
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
              <span className="hidden sm:inline">Hover address for full text</span>
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
