'use client';

import { useState } from 'react';
import {
  Building2,
  Inbox,
  CheckCircle2,
  CalendarDays,
  Users,
  IndianRupee,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Can } from '@/components/Auth/can';
import { useCorporateOrders, useMarkCorporateOrderPaid } from '@/api/hooks/useAdminUserFinancial';
import type { CorporatePaymentStatus } from '@/api/admin-user-financial.api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UserCorporateOrdersTabProps {
  userId: string;
}

const PAYMENT_STATUS_BADGE_STYLES: Record<CorporatePaymentStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
  paid: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  overdue: 'bg-red-500/15 text-red-600 border-red-500/20',
};

function OrderSkeletonCard() {
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

function OrderSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <OrderSkeletonCard key={i} />
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
      <h3 className="text-lg font-semibold text-foreground mb-1">No corporate orders found</h3>
      <p className="text-sm text-muted-foreground text-center">
        No corporate orders found for this user.
      </p>
    </div>
  );
}

function getPaymentStatusLabel(status: CorporatePaymentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function MarkOrderPaidButton({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}) {
  const markPaidMutation = useMarkCorporateOrderPaid(userId);
  const [paymentRef, setPaymentRef] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Can permission="invoice:mark-paid">
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark Payment as Paid
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl min-w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Payment as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this corporate order&apos;s payment as paid? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Payment Reference (optional)
            </label>
            <Input
              placeholder="Enter payment reference"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                markPaidMutation.mutate({
                  orderId,
                  data: { payment_reference: paymentRef || undefined },
                }, {
                  onSuccess: () => setDialogOpen(false),
                });
              }}
              disabled={markPaidMutation.isPending}
            >
              {markPaidMutation.isPending ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Can>
  );
}

export function UserCorporateOrdersTab({ userId }: UserCorporateOrdersTabProps) {
  const { data: orders, isLoading, isError } = useCorporateOrders(userId);

  return (
    <Can
      permission="invoice:view:any"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="p-5 rounded-2xl bg-red-50 mb-6">
            <Building2 className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to view corporate orders.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Corporate Orders</h3>
        </div>

        {/* Content */}
        {isLoading ? (
          <OrderSkeletonGrid />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <Building2 className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Failed to Load</h3>
            <p className="text-sm text-muted-foreground text-center">
              Unable to fetch corporate orders. Please try again later.
            </p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => {
              const canMarkPaid = order.payment_status === 'pending' || order.payment_status === 'overdue';

              return (
                <div
                  key={order._id}
                  className="rounded-3xl border border-border/40 bg-card shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">
                        {order.order_id}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-[11px] font-semibold px-2.5 py-0.5 shrink-0', PAYMENT_STATUS_BADGE_STYLES[order.payment_status])}
                    >
                      {getPaymentStatusLabel(order.payment_status)}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div>
                      Company: <span className="text-foreground">{order.company_name}</span>
                    </div>
                    <div>Status: <span className="text-foreground">{getStatusLabel(order.status)}</span></div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {format(new Date(order.start_date), 'dd MMM yyyy')} - {format(new Date(order.end_date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {order.headcount} total (Veg: {order.veg_count}, Non-veg: {order.nonveg_count})
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <IndianRupee className="h-3.5 w-3.5" />
                      <span className="font-semibold text-sm text-foreground">
                        ₹{order.final_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {canMarkPaid && (
                      <MarkOrderPaidButton orderId={order._id} userId={userId} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Can>
  );
}
