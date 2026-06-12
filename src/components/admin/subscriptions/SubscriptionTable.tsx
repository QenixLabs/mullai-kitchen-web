'use client';

import Link from 'next/link';
import {
  Eye,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  MapPin,
  UtensilsCrossed,
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
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

const statusConfig: Record<
  string,
  { variant: 'success' | 'warning' | 'inactive' | 'destructive'; dot: string }
> = {
  [SubscriptionStatus.ACTIVE]: {
    variant: 'success',
    dot: 'bg-success',
  },
  [SubscriptionStatus.PAUSED]: {
    variant: 'warning',
    dot: 'bg-warning',
  },
  [SubscriptionStatus.EXPIRED]: {
    variant: 'inactive',
    dot: 'bg-muted-foreground',
  },
  [SubscriptionStatus.CANCELLED]: {
    variant: 'destructive',
    dot: 'bg-destructive',
  },
};

const mealColors: Record<string, string> = {
  Breakfast: 'bg-amber-100 text-amber-700 border-amber-200',
  Lunch: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Dinner: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

function getSubscriberName(sub: AdminSubscription): string {
  if (typeof sub.user_id === 'object' && sub.user_id !== null) {
    return sub.user_id.name || sub.user_id.email || 'Unknown';
  }
  return 'Unknown';
}

function getSubscriberEmail(sub: AdminSubscription): string | undefined {
  if (typeof sub.user_id === 'object' && sub.user_id !== null) {
    return sub.user_id.email;
  }
  return undefined;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getProgressPercent(sub: AdminSubscription): number {
  if (!sub.total_deliveries) return 0;
  return Math.round((sub.completed_deliveries / sub.total_deliveries) * 100);
}

function getPlanColor(planName: string): string {
  if (planName.toLowerCase().includes('premium')) return 'bg-purple-100 text-purple-700 border-purple-200';
  if (planName.toLowerCase().includes('flex')) return 'bg-sky-100 text-sky-700 border-sky-200';
  if (planName.toLowerCase().includes('classic')) return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
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
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-4 w-24 hidden lg:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-3 w-24 hidden lg:block" />
              <Skeleton className="h-8 w-20 ml-auto rounded-md" />
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

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
              <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscriber</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outlet</TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meals</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Period</TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress</TableHead>
              <TableHead className="w-24 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((sub) => {
              const pct = getProgressPercent(sub);
              const name = getSubscriberName(sub);
              const email = getSubscriberEmail(sub);
              const status = statusConfig[sub.status];
              return (
                <TableRow
                  key={sub._id}
                  className="group transition-colors hover:bg-muted/30 border-b last:border-0"
                >
                  {/* Subscriber */}
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 bg-primary/10 text-primary font-semibold text-sm">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{name}</p>
                        {email && (
                          <p className="text-xs text-muted-foreground truncate">{email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Plan */}
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-medium text-xs px-2.5 py-0.5 rounded-md',
                        getPlanColor(sub.plan_name)
                      )}
                    >
                      {sub.plan_name}
                    </Badge>
                  </TableCell>

                  {/* Outlet */}
                  <TableCell className="hidden lg:table-cell py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                        <MapPin className="h-3 w-3 text-primary" />
                      </span>
                      <span className="truncate max-w-[140px]">{sub.outlet_name}</span>
                    </div>
                  </TableCell>

                  {/* Meals */}
                  <TableCell className="hidden xl:table-cell py-4">
                    <div className="flex flex-wrap gap-1">
                      {sub.meals_included.map((meal) => (
                        <span
                          key={meal}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            mealColors[meal] || 'bg-slate-100 text-slate-700 border-slate-200'
                          )}
                        >
                          <UtensilsCrossed className="h-2.5 w-2.5" />
                          {meal}
                        </span>
                      ))}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', status.dot)} />
                      <Badge variant={status.variant} className="text-xs">
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Period */}
                  <TableCell className="hidden sm:table-cell py-4">
                    <div className="flex flex-col text-sm">
                      <span className="text-foreground">
                        {new Date(sub.start_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        {' — '}
                        {new Date(sub.end_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {sub.renewal_date
                          ? `Renews ${new Date(sub.renewal_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                          : 'No renewal'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Progress */}
                  <TableCell className="hidden lg:table-cell py-4">
                    <div className="flex flex-col gap-1.5 w-28">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {sub.completed_deliveries}/{sub.total_deliveries}
                        </span>
                        <span
                          className={cn(
                            'font-semibold tabular-nums',
                            pct >= 100
                              ? 'text-success'
                              : pct >= 50
                                ? 'text-primary'
                                : 'text-gold'
                          )}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            pct >= 100
                              ? 'bg-success'
                              : pct >= 50
                                ? 'bg-primary'
                                : 'bg-gold',
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="pr-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-70 group-hover:opacity-100 transition-opacity h-8 px-3"
                      asChild
                    >
                      <Link href={`/admin/subscriptions/${sub._id}`}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
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
            Showing <span className="font-medium text-foreground">{start}</span>
            –<span className="font-medium text-foreground">{end}</span> of{' '}
            <span className="font-medium text-foreground">{total ?? data.length}</span>
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(page - 1)}
                  className={cn(
                    page <= 1 && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
              {getPageNumbers().map((p, i) =>
                p === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={page === p}
                      onClick={() => onPageChange(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(page + 1)}
                  className={cn(
                    page >= totalPages && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
