'use client';

import { useState } from 'react';
import { Package, CalendarDays, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Can } from '@/components/Auth/can';
import { useUserSubscriptions } from '@/api/hooks/useAdminUserFinancial';
import type { SubscriptionStatus } from '@/api/admin-user-financial.api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UserSubscriptionsTabProps {
  userId: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE_STYLES: Record<SubscriptionStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  paused: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
  expired: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
  cancelled: 'bg-red-500/15 text-red-600 border-red-500/20',
};

function SubscriptionSkeletonCard() {
  return (
    <div className="rounded-3xl border border-border/40 bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function SubscriptionSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SubscriptionSkeletonCard key={i} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="p-5 rounded-2xl bg-muted/60 mb-6">
        <Inbox className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No subscriptions found</h3>
      <p className="text-sm text-muted-foreground text-center">
        No subscriptions found for this user.
      </p>
    </div>
  );
}

function getStatusLabel(status: SubscriptionStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function UserSubscriptionsTab({ userId }: UserSubscriptionsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useUserSubscriptions(userId, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit,
  });

  return (
    <Can
      permission="subscription:view:any"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="p-5 rounded-2xl bg-red-50 mb-6">
            <Package className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to view subscriptions.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filter */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Subscriptions</h3>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <SubscriptionSkeletonGrid />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <Package className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Failed to Load</h3>
            <p className="text-sm text-muted-foreground text-center">
              Unable to fetch subscriptions. Please try again later.
            </p>
          </div>
        ) : !data || data.subscriptions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.subscriptions.map((sub) => (
                <div
                  key={sub._id}
                  className="rounded-3xl border border-border/40 bg-card shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">
                        {sub.plan_name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-[11px] font-semibold px-2.5 py-0.5 shrink-0', STATUS_BADGE_STYLES[sub.status])}
                    >
                      {getStatusLabel(sub.status)}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {format(new Date(sub.start_date), 'dd MMM yyyy')} - {format(new Date(sub.end_date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Deliveries: {sub.completed_deliveries}/{sub.total_deliveries} completed ({sub.remaining_deliveries} remaining)
                    </div>
                    {sub.outlet_name && (
                      <div className="text-muted-foreground">
                        Outlet: {sub.outlet_name}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">
                      Total Amount
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      ₹{sub.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {data.page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  className="h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Can>
  );
}
