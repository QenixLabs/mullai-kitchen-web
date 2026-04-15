'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminSubscriptionActivity } from '@/api/hooks/useAdminSubscriptions';
import { PauseCreditStatus, PausePeriodStatus } from '@/api/types/admin-subscription.types';

interface SubscriptionActivityLogProps {
  subscriptionId: string;
}

const creditStatusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [PauseCreditStatus.CREDITED]: 'default',
  [PauseCreditStatus.PENDING_CREDIT]: 'secondary',
  [PauseCreditStatus.CANCELLED]: 'outline',
};

export function SubscriptionActivityLog({ subscriptionId }: SubscriptionActivityLogProps) {
  const { data, isLoading } = useAdminSubscriptionActivity(subscriptionId);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Log</h2>
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-4">Loading activity...</div>
      ) : !data?.data?.length ? (
        <div className="text-sm text-muted-foreground py-4">No activity recorded</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Created</TableHead>
                <TableHead>Paused Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Credit Amount</TableHead>
                <TableHead>Credit Status</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((period) => (
                <TableRow key={period._id}>
                  <TableCell>{new Date(period.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {period.paused_dates.map(d => new Date(d).toLocaleDateString()).join(', ')}
                  </TableCell>
                  <TableCell>{period.days_paused}</TableCell>
                  <TableCell>₹{period.credit_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={creditStatusVariant[period.credit_status] || 'secondary'}>
                      {period.credit_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{period.reason || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
