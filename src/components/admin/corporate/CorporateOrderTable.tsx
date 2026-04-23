'use client';

import Link from 'next/link';
import { Eye, XCircle } from 'lucide-react';
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
import type { ICorporateOrder, CorporateOrderStatus, CorporatePaymentStatus } from '@/api/types/corporate.types';

interface CorporateOrderTableProps {
  data: ICorporateOrder[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCancel: (order: ICorporateOrder) => void;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  draft: 'secondary',
  pending_payment: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
};

const statusLabel: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  pending_payment: 'Pending Payment',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const paymentStatusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  paid: 'default',
  pending: 'secondary',
  overdue: 'destructive',
};

const paymentStatusLabel: Record<string, string> = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
};

export function CorporateOrderTable({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onCancel,
}: CorporateOrderTableProps) {
  if (isLoading) {
    return <div className="flex justify-center py-8 text-muted-foreground">Loading corporate orders...</div>;
  }

  if (!data.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No corporate orders found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Headcount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order.order_id}</TableCell>
                <TableCell>{order.company_name}</TableCell>
                <TableCell>{order.outlet_name}</TableCell>
                <TableCell>{new Date(order.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.end_date).toLocaleDateString()}</TableCell>
                <TableCell>{order.headcount}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status] || 'secondary'}>
                    {statusLabel[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={paymentStatusVariant[order.payment_status] || 'secondary'}>
                    {paymentStatusLabel[order.payment_status] || order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/admin/corporate/orders/${order._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Can permission="corporate:modify">
                      {(order.status === 'active' || order.status === 'pending_payment' || order.status === 'draft') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
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
