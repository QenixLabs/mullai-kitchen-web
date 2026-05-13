'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAdminSubscriptionActivity } from '@/api/hooks/useAdminSubscriptions';
import { PauseCreditStatus } from '@/api/types/admin-subscription.types';
import { ClipboardList, Search } from 'lucide-react';

interface SubscriptionActivityLogProps {
  subscriptionId: string;
}

const creditStatusClass: Record<string, string> = {
  [PauseCreditStatus.CREDITED]: 'bg-success/10 text-success border-success/20',
  [PauseCreditStatus.PENDING_CREDIT]: 'bg-warning/10 text-warning border-warning/20',
  [PauseCreditStatus.CANCELLED]: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

export function SubscriptionActivityLog({ subscriptionId }: SubscriptionActivityLogProps) {
  const { data, isLoading } = useAdminSubscriptionActivity(subscriptionId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Activity Log</h2>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      ) : !data?.data?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No activity recorded</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Pause and skip actions will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Date Created</TableHead>
                <TableHead className="hidden md:table-cell">Paused Dates</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead className="text-right">Credit Amount</TableHead>
                <TableHead>Credit Status</TableHead>
                <TableHead className="hidden lg:table-cell">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((period) => (
                <TableRow
                  key={period._id}
                  className="group transition-colors hover:bg-primary/[0.03]"
                >
                  <TableCell className="text-sm">
                    {new Date(period.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm text-muted-foreground">
                    {period.paused_dates
                      .map((d) =>
                        new Date(d).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        }),
                      )
                      .join(', ')}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {period.days_paused}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums text-sm">
                    ₹{period.credit_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusPill className={creditStatusClass[period.credit_status]}>
                      {period.credit_status.replace(/_/g, ' ')}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-sm text-muted-foreground">
                    {period.reason || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
