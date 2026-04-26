'use client';

import Link from 'next/link';
import {
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TicketPercent,
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
import { format } from 'date-fns';
import type { AdminCoupon } from '@/api/types/admin-coupon.types';
import type { CouponStatus } from '@/api/types/coupon.types';

interface CouponTableProps {
  data: AdminCoupon[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  onStatusChange: (coupon: AdminCoupon, status: CouponStatus) => void;
}

function HeaderStrip({ count, total }: { count: number; total?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <TicketPercent className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Coupons</h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: CouponStatus }) {
  const tone: Record<CouponStatus, string> = {
    ACTIVE: 'bg-success/10 text-success border-success/20',
    INACTIVE: 'bg-muted text-muted-foreground border-muted-foreground/20',
    EXPIRED: 'bg-warning/10 text-warning border-warning/20',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', tone[status])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'ACTIVE' ? 'bg-success' : status === 'INACTIVE' ? 'bg-muted-foreground' : 'bg-warning')} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function TypeChip({ type }: { type: AdminCoupon['type'] }) {
  const label = type === 'PERCENTAGE' ? 'Percentage' : 'Fixed';
  return (
    <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
  );
}

function ApplicabilityChip({ applicability }: { applicability: AdminCoupon['applicable_to'] }) {
  const label = applicability === 'SUBSCRIPTION' ? 'Subscription' : applicability === 'ADDON' ? 'Add-on' : 'Both';
  return (
    <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
  );
}

export function CouponTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onStatusChange,
}: CouponTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={0} />
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
          <HeaderStrip count={0} total={total} />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <TicketPercent className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No coupons found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total ?? 0);

  return (
    <TooltipProvider delayDuration={250}>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={data.length} total={total} />
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Code
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Type
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Value
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  Applicability
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Usage
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">
                  Valid Until
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
              {data.map((coupon, idx) => {
                const isLast = idx === data.length - 1;
                const nextStatus: CouponStatus = coupon.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                return (
                  <TableRow
                    key={coupon._id}
                    className={cn(
                      'group transition-colors hover:bg-accent/20',
                      !isLast && 'border-b border-border/50',
                    )}
                  >
                    <TableCell className="px-4 py-3">
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 sm:table-cell">
                      <TypeChip type={coupon.type} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">
                        {coupon.type === 'PERCENTAGE'
                          ? `${coupon.value}%`
                          : formatCurrency(coupon.value)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 md:table-cell">
                      <ApplicabilityChip applicability={coupon.applicable_to} />
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-sm tabular-nums text-foreground">
                        {coupon.usage_count} / {coupon.usage_limit}
                      </span>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 xl:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(coupon.valid_until), 'dd MMM yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusPill status={coupon.status} />
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
                              <Link href={`/admin/coupons/${coupon._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">View coupon</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => onStatusChange(coupon, nextStatus)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">
                              {coupon.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} coupon
                            </p>
                          </TooltipContent>
                        </Tooltip>
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
                <span className="font-semibold text-foreground">{total}</span>
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
                <span className="font-semibold text-foreground">{data.length}</span> coupon
                {data.length === 1 ? '' : 's'}
                {total !== undefined && total !== data.length && (
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
    </TooltipProvider>
  );
}
