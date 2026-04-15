'use client';

import Link from 'next/link';
import { Eye, Pause, Play } from 'lucide-react';
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
import { Can } from '@/components/Auth/can';
import { SubscriptionStatus } from '@/api/types/admin-subscription.types';
import type { AdminSubscription } from '@/api/types/admin-subscription.types';

interface SubscriptionTableProps {
  data: AdminSubscription[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [SubscriptionStatus.ACTIVE]: 'default',
  [SubscriptionStatus.PAUSED]: 'secondary',
  [SubscriptionStatus.EXPIRED]: 'outline',
  [SubscriptionStatus.CANCELLED]: 'destructive',
};

const statusLabel: Record<string, string> = {
  [SubscriptionStatus.ACTIVE]: 'Active',
  [SubscriptionStatus.PAUSED]: 'Paused',
  [SubscriptionStatus.EXPIRED]: 'Expired',
  [SubscriptionStatus.CANCELLED]: 'Cancelled',
};

function getSubscriberName(sub: AdminSubscription): string {
  if (typeof sub.user_id === 'object' && sub.user_id !== null) {
    return sub.user_id.name || sub.user_id.email || 'Unknown';
  }
  return 'Unknown';
}

function getProgress(sub: AdminSubscription): string {
  if (!sub.total_deliveries) return '-';
  const pct = Math.round((sub.completed_deliveries / sub.total_deliveries) * 100);
  return `${pct}%`;
}

export function SubscriptionTable({ data, isLoading, page, totalPages, onPageChange }: SubscriptionTableProps) {
  if (isLoading) {
    return <div className="flex justify-center py-8 text-muted-foreground">Loading subscriptions...</div>;
  }

  if (!data.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No subscriptions found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscriber</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead>Meals</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((sub) => (
              <TableRow key={sub._id}>
                <TableCell className="font-medium">{getSubscriberName(sub)}</TableCell>
                <TableCell>{sub.plan_name}</TableCell>
                <TableCell>{sub.outlet_name}</TableCell>
                <TableCell className="max-w-[150px] truncate">{sub.meals_included.join(', ')}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[sub.status] || 'secondary'}>
                    {statusLabel[sub.status] || sub.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(sub.end_date).toLocaleDateString()}</TableCell>
                <TableCell>{getProgress(sub)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/admin/subscriptions/${sub._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
