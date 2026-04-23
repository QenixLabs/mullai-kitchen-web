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
import { Button } from '@/components/ui/button';
import type { ICorporateDailyOrder } from '@/api/types/corporate.types';

interface CorporateDailyOrderTableProps {
  data: ICorporateDailyOrder[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  confirmed: 'default',
  preparing: 'default',
  ready: 'default',
  out_for_delivery: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

const statusClass: Record<string, string> = {
  ready: 'bg-green-100 text-green-800',
  out_for_delivery: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
};

export function CorporateDailyOrderTable({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: CorporateDailyOrderTableProps) {
  if (isLoading) {
    return <div className="flex justify-center py-8 text-muted-foreground">Loading daily orders...</div>;
  }

  if (!data.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No daily orders found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Veg Count</TableHead>
              <TableHead>Non-Veg Count</TableHead>
              <TableHead>Total Meals</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{order.order_id || order.corporate_order_id}</TableCell>
                <TableCell>
                  {order.company_name || '-'}
                </TableCell>
                <TableCell>{order.veg_count}</TableCell>
                <TableCell>{order.nonveg_count}</TableCell>
                <TableCell className="font-medium">{order.total_meals}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant[order.status] || 'secondary'}
                    className={statusClass[order.status]}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {order.delivery_address?.address_line || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
