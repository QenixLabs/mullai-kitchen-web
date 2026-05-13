'use client';

import Link from 'next/link';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  ClipboardList,
  MapPin,
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SubscriptionStatus } from '@/api/types/admin-subscription.types';
import type { AdminSubscription } from '@/api/types/admin-subscription.types';

interface SubscriptionTableProps {
  data: AdminSubscription[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}

const statusClass: Record<string, string> = {
  [SubscriptionStatus.ACTIVE]: 'bg-success/10 text-success border-success/20',
  [SubscriptionStatus.PAUSED]: 'bg-warning/10 text-warning border-warning/20',
  [SubscriptionStatus.EXPIRED]: 'bg-muted text-muted-foreground border-muted-foreground/20',
  [SubscriptionStatus.CANCELLED]: 'bg-destructive/10 text-destructive border-destructive/20',
};

function getSubscriberName(sub: AdminSubscription): string {
  if (typeof sub.user_id === 'object' && sub.user_id !== null) {
    return sub.user_id.name || sub.user_id.email || 'Unknown';
  }
  return 'Unknown';
}

function getProgressPercent(sub: AdminSubscription): number {
  if (!sub.total_deliveries) return 0;
  return Math.round((sub.completed_deliveries / sub.total_deliveries) * 100);
}

export function SubscriptionTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
}: SubscriptionTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 ml-auto" />
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
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No subscriptions found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Try adjusting your search or filters.
        </p>
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
              <TableHead>Subscriber</TableHead>
              <TableHead className="hidden md:table-cell">Plan</TableHead>
              <TableHead className="hidden lg:table-cell">Outlet</TableHead>
              <TableHead className="hidden xl:table-cell">Meals</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Period</TableHead>
              <TableHead className="hidden lg:table-cell">Progress</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((sub) => {
              const pct = getProgressPercent(sub);
              return (
                <TableRow
                  key={sub._id}
                  className="group transition-colors hover:bg-primary/[0.03]"
                >
                  <TableCell className="font-medium">
                    {getSubscriberName(sub)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {sub.plan_name}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {sub.outlet_name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell max-w-[150px] truncate text-sm text-muted-foreground">
                    {sub.meals_included.join(', ')}
                  </TableCell>
                  <TableCell>
                    <StatusPill className={statusClass[sub.status]}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {new Date(sub.start_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    —{' '}
                    {new Date(sub.end_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            pct >= 100
                              ? 'bg-success'
                              : pct >= 50
                                ? 'bg-primary'
                                : 'bg-gold',
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link href={`/admin/subscriptions/${sub._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
                    <span key={p} className="text-xs text-muted-foreground px-1">
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
