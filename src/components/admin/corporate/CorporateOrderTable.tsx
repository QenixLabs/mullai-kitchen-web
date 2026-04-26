'use client';

import Link from 'next/link';
import { Eye, XCircle, ChevronLeft, ChevronRight, Search, ClipboardList } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No orders found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">Try adjusting your search or filters.</p>
      </div>
    );
  }

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total ?? data.length);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Order ID</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead className="hidden lg:table-cell">Outlet</TableHead>
              <TableHead className="hidden xl:table-cell">Period</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Headcount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Payment</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow
                key={order._id}
                className="group transition-colors hover:bg-primary/[0.03]"
              >
                <TableCell className="font-medium">{order.order_id}</TableCell>
                <TableCell className="hidden md:table-cell">{order.company_name}</TableCell>
                <TableCell className="hidden lg:table-cell">{order.outlet_name}</TableCell>
                <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                  {new Date(order.start_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })} -{' '}
                  {new Date(order.end_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right tabular-nums">{order.headcount}</TableCell>
                <TableCell>
                  <StatusPill className={orderStatusClass[order.status]}>
                    {order.status.replace(/_/g, ' ')}
                  </StatusPill>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusPill className={paymentStatusClass[order.payment_status]}>
                    {order.payment_status}
                  </StatusPill>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link href={`/admin/corporate/orders/${order._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Can permission="corporate:modify">
                      {(order.status === 'active' ||
                        order.status === 'pending_payment' ||
                        order.status === 'draft') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive opacity-60 group-hover:opacity-100 transition-opacity"
                          onClick={() => onCancel(order)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing {start}–{end} of {total ?? data.length}
          </p>
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
              const near =
                Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
              if (!near) {
                if (p === page - 2 || p === page + 2)
                  return (
                    <span key={p} className="text-xs text-muted-foreground px-1">…</span>
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
                    page === p &&
                      'bg-primary text-primary-foreground hover:bg-primary/90',
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
      )}
    </div>
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
